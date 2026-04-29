"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import type { Position } from "@db/position";
import type { UserProfileEntity } from "@db/types";

import { cn } from "@shared/lib/utils/css";
import Button from "@shared/ui/Button";
import DropdownSelect from "@shared/ui/DropdownSelect";
import Icon from "@shared/ui/Icon";
import { ModalChromeFooter, ModalChromeHeader } from "@shared/ui/ModalChrome";
import TextField from "@shared/ui/TextField";

import { apiJson } from "../lib/api";
import { POSITION_LABELS, POSITION_VALUES } from "../lib/positions";
import {
  formatPhonePretty,
  normalizePhoneDigits,
  phoneLooksValid,
} from "../lib/phone";
import {
  formToSchedulePayload,
  profileToForm,
  type ProfileForm,
} from "../lib/profile-map";
import PhoneCodeConfirmPanel from "./PhoneCodeConfirmPanel";
import { WorkScheduleReadonlyCard } from "./WorkScheduleSummary";

function validateEditableProfile(form: ProfileForm): Record<string, string> {
  const e: Record<string, string> = {};
  if (!form.surname.trim()) e.surname = "Обязательное поле";
  if (!form.name.trim()) e.name = "Обязательное поле";
  if (!form.middlename.trim()) e.middlename = "Обязательное поле";
  if (!POSITION_VALUES.includes(form.position)) {
    e.position = "Обязательное поле";
  }
  return e;
}

const POSITION_OPTIONS = POSITION_VALUES.map((v) => ({
  value: v,
  label: POSITION_LABELS[v],
}));

const PHONE_RESEND_COOLDOWN_SEC = 180;

export default function UserDetailSheet({
  profile,
  pending,
  setPending,
  onClose,
  onUnsavedCloseAttempt,
  onSaved,
  onDirtyChange,
}: {
  profile: UserProfileEntity;
  pending: boolean;
  setPending: (v: boolean) => void;
  onClose: () => void;
  onUnsavedCloseAttempt: () => void;
  onSaved: (p: UserProfileEntity) => void;
  onDirtyChange?: (dirty: boolean) => void;
}) {
  const [form, setForm] = useState<ProfileForm>(() => profileToForm(profile));
  const snapRef = useRef(JSON.stringify(profileToForm(profile)));

  const [phoneStep, setPhoneStep] = useState<"idle" | "phoneOnly" | "code">(
    "idle",
  );
  const [phoneDigits, setPhoneDigits] = useState("");
  const [phoneFieldError, setPhoneFieldError] = useState<string | undefined>();
  const [code, setCode] = useState("");
  const [phoneCodeError, setPhoneCodeError] = useState(false);
  const [phoneResendSec, setPhoneResendSec] = useState(0);

  useEffect(() => {
    const next = profileToForm(profile);
    setForm(next);
    snapRef.current = JSON.stringify(next);
  }, [profile]);

  useEffect(() => {
    setPhoneStep("idle");
    setPhoneDigits("");
    setPhoneFieldError(undefined);
    setCode("");
    setPhoneCodeError(false);
    setPhoneResendSec(0);
  }, [profile.id]);

  const profileDirty = JSON.stringify(form) !== snapRef.current;
  const phoneSurfaceDirty =
    phoneStep === "code" ||
    (phoneStep === "phoneOnly" &&
      normalizePhoneDigits(phoneDigits) !==
        normalizePhoneDigits(form.phoneDigits));
  const hasUnsavedChanges = profileDirty || phoneSurfaceDirty;

  const fieldErrors = useMemo(() => {
    if (!profileDirty) return {};
    return validateEditableProfile(form);
  }, [form, profileDirty]);

  const hasBlockingErrors = Object.keys(fieldErrors).length > 0;

  useEffect(() => {
    onDirtyChange?.(hasUnsavedChanges);
  }, [hasUnsavedChanges, onDirtyChange]);

  const phoneResendCooldown = phoneResendSec > 0;
  useEffect(() => {
    if (!phoneResendCooldown) return;
    const id = window.setInterval(() => {
      setPhoneResendSec((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [phoneResendCooldown]);

  const headerClose = () => {
    if (hasUnsavedChanges) {
      onUnsavedCloseAttempt();
      return;
    }
    onClose();
  };

  const saveProfile = async () => {
    if (hasBlockingErrors) return;
    setPending(true);
    try {
      const updated = await apiJson<UserProfileEntity>(
        `/api/users/${profile.id}`,
        {
          method: "PUT",
          body: JSON.stringify({
            name: form.name.trim(),
            surname: form.surname.trim(),
            middlename: form.middlename.trim(),
            position: form.position,
            schedule: formToSchedulePayload(form),
          }),
        },
      );
      snapRef.current = JSON.stringify(profileToForm(updated));
      onSaved(updated);
    } catch {
      window.alert("Не удалось сохранить");
    } finally {
      setPending(false);
    }
  };

  const postSendCodeRequest = (digits: string) =>
    apiJson("/api/users/send-code", {
      method: "POST",
      body: JSON.stringify({
        userId: profile.id,
        phone: `+${normalizePhoneDigits(digits)}`,
      }),
    });

  const openPhoneCodeStep = (digits: string) => {
    setPhoneDigits(digits);
    setPhoneStep("code");
    setCode("");
    setPhoneCodeError(false);
    setPhoneResendSec(0);
  };

  const sendPhoneChange = async () => {
    if (!phoneLooksValid(phoneDigits)) {
      setPhoneFieldError("Введите корректный номер телефона");
      return;
    }
    setPhoneFieldError(undefined);
    setPending(true);
    try {
      await postSendCodeRequest(phoneDigits);
      openPhoneCodeStep(phoneDigits);
    } catch {
      window.alert("Ошибка отправки кода");
    } finally {
      setPending(false);
    }
  };

  const openPhoneEditSheet = () => {
    setPhoneFieldError(undefined);
    setPhoneDigits(form.phoneDigits);
    setPhoneStep("phoneOnly");
  };

  const backFromPhoneOnlyToProfile = () => {
    setPhoneFieldError(undefined);
    setPhoneDigits(form.phoneDigits);
    setPhoneStep("idle");
  };

  const resendPhoneCode = async () => {
    if (phoneResendSec > 0 || pending) return;
    setPending(true);
    try {
      await apiJson("/api/users/send-code", {
        method: "POST",
        body: JSON.stringify({
          userId: profile.id,
          phone: `+${normalizePhoneDigits(phoneDigits)}`,
        }),
      });
      setCode("");
      setPhoneCodeError(false);
      setPhoneResendSec(PHONE_RESEND_COOLDOWN_SEC);
    } catch {
      window.alert("Не удалось отправить код");
    } finally {
      setPending(false);
    }
  };

  const confirmPhoneChange = async () => {
    setPending(true);
    try {
      const upd = await apiJson<UserProfileEntity>("/api/users/confirm-code", {
        method: "POST",
        body: JSON.stringify({
          userId: profile.id,
          phone: `+${normalizePhoneDigits(phoneDigits)}`,
          code,
        }),
      });
      snapRef.current = JSON.stringify(profileToForm(upd));
      onSaved(upd);
      setPhoneStep("idle");
      setForm(profileToForm(upd));
      setPhoneCodeError(false);
      setPhoneResendSec(0);
    } catch {
      setPhoneCodeError(true);
      setPhoneResendSec(PHONE_RESEND_COOLDOWN_SEC);
    } finally {
      setPending(false);
    }
  };

  const phoneLineDisplay =
    formatPhonePretty(phoneDigits).replace(/^\+\s*/, "+") || "—";

  return (
    <div className="pointer-events-none absolute inset-0 z-40 flex items-stretch justify-start">
      <div className="pointer-events-auto flex h-full max-h-full min-h-0 w-[400px] flex-col overflow-hidden rounded-br-l rounded-tr-l bg-background-none shadow-[0px_4px_16px_-4px_rgba(9,18,58,0.1)]">
        {phoneStep === "code" ? (
          <PhoneCodeConfirmPanel
            phoneLine={phoneLineDisplay}
            code={code}
            codeError={phoneCodeError}
            onCodeChange={(c) => {
              setCode(c);
              setPhoneCodeError(false);
              setPhoneResendSec(0);
            }}
            onBack={() => setPhoneStep("phoneOnly")}
            onConfirm={() => void confirmPhoneChange()}
            pending={pending}
            resend={
              phoneCodeError
                ? {
                    onResend: () => void resendPhoneCode(),
                    secondsLeft: phoneResendSec,
                  }
                : undefined
            }
          />
        ) : phoneStep === "phoneOnly" ? (
          <>
            <ModalChromeHeader
              title="Изменить номер"
              onBack={backFromPhoneOnlyToProfile}
              onClose={headerClose}
            />
            <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-8 pb-4 pt-4">
              <TextField
                name="phone"
                placeholder="Номер телефона"
                aria-label="Номер телефона"
                autoComplete="tel"
                inputMode="tel"
                value={formatPhonePretty(phoneDigits).replace(/^\+\s*/, "+")}
                error={phoneFieldError}
                onChange={(e) => {
                  setPhoneFieldError(undefined);
                  setPhoneDigits(normalizePhoneDigits(e.target.value));
                }}
              />
            </div>
            <ModalChromeFooter>
              <Button
                variant="primary"
                type="button"
                disabled={
                  pending ||
                  normalizePhoneDigits(phoneDigits) ===
                    normalizePhoneDigits(form.phoneDigits) ||
                  !phoneLooksValid(phoneDigits)
                }
                className={
                  pending ||
                  normalizePhoneDigits(phoneDigits) ===
                    normalizePhoneDigits(form.phoneDigits) ||
                  !phoneLooksValid(phoneDigits)
                    ? "bg-background-max text-symb-secondary hover:bg-background-max disabled:bg-background-max"
                    : ""
                }
                onClick={() => void sendPhoneChange()}
              >
                Сохранить
              </Button>
            </ModalChromeFooter>
          </>
        ) : (
          <>
        <ModalChromeHeader title="Пользователь" onClose={headerClose} />

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-8 pb-4 pt-4">
          <TextField
            name="surname"
            placeholder="Фамилия"
            aria-label="Фамилия"
            value={form.surname}
            error={fieldErrors.surname}
            onChange={(e) =>
              setForm((f) => ({ ...f, surname: e.target.value }))
            }
          />
          <TextField
            name="name"
            placeholder="Имя"
            aria-label="Имя"
            value={form.name}
            error={fieldErrors.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <TextField
            name="middlename"
            placeholder="Отчество"
            aria-label="Отчество"
            value={form.middlename}
            error={fieldErrors.middlename}
            onChange={(e) =>
              setForm((f) => ({ ...f, middlename: e.target.value }))
            }
          />

          <div className="flex flex-col gap-1">
            <DropdownSelect
              id="detail-user-position"
              aria-label="Должность"
              value={form.position}
              onChange={(v) =>
                setForm((f) => ({
                  ...f,
                  position: v as Position,
                }))
              }
              options={POSITION_OPTIONS}
              placeholder="Выберите должность"
              invalid={Boolean(fieldErrors.position)}
            />
            {fieldErrors.position ? (
              <span className="text-m text-symb-error">
                {fieldErrors.position}
              </span>
            ) : null}
          </div>

          <WorkScheduleReadonlyCard
            weekdaysStart={form.weekdaysStart}
            weekdaysEnd={form.weekdaysEnd}
            lunchStart={form.lunchStart}
            lunchEnd={form.lunchEnd}
          />

          <div className="flex flex-col gap-2 pt-4">
            <div className="flex flex-col gap-1">
              <span
                className="text-m text-symb-primary"
                id="detail-phone-label"
              >
                Номер телефона
              </span>
              <button
                type="button"
                aria-labelledby="detail-phone-label"
                className={cn(
                  "group flex h-12 w-full items-center gap-3 rounded-s py-3 pl-4 pr-2.5 text-left transition-colors hover:brightness-[0.99]",
                  profile.phoneVerified
                    ? "bg-background-med"
                    : "bg-background-error",
                )}
                disabled={pending}
                onClick={() => openPhoneEditSheet()}
              >
                <span className="min-w-0 flex-1 truncate text-l text-symb-secondary">
                  {formatPhonePretty(form.phoneDigits)}
                </span>
                <span className="inline-flex shrink-0 items-center gap-1">
                  {!profile.phoneVerified ? (
                    <span className="inline-flex shrink-0" aria-hidden>
                      <Icon name="error" className="text-symb-primary" />
                    </span>
                  ) : null}
                  <span
                    className="inline-flex size-8 shrink-0 items-center justify-center rounded-s bg-background-none opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-disabled:opacity-0"
                    aria-hidden
                  >
                    <Icon
                      name="chevron_forward"
                      size={24}
                      className="text-symb-secondary"
                    />
                  </span>
                </span>
              </button>
              {!profile.phoneVerified ? (
                <div className="rounded-s bg-background-med px-4 py-1.5">
                  <p className="text-m leading-[1.4] text-symb-primary">
                    Требуется подтверждение
                  </p>
                </div>
              ) : null}
            </div>

          </div>
        </div>

        <ModalChromeFooter>
          <Button
            variant="primary"
            type="button"
            disabled={
              !profileDirty ||
              pending ||
              hasBlockingErrors
            }
            className={
              !profileDirty || pending || hasBlockingErrors
                ? "bg-background-max text-symb-secondary hover:bg-background-max disabled:bg-background-max"
                : ""
            }
            onClick={() => void saveProfile()}
          >
            Сохранить
          </Button>
        </ModalChromeFooter>
          </>
        )}
      </div>
    </div>
  );
}
