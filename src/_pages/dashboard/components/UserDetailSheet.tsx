"use client";

import { useEffect, useRef, useState } from "react";

import type { Position } from "@db/position";
import type { UserProfileEntity } from "@db/types";

import Button from "@shared/ui/Button";
import CodeInput from "@shared/ui/CodeInput";
import DropdownSelect from "@shared/ui/DropdownSelect";
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
import { secondsToTimeLabel } from "../lib/schedule";

const POSITION_OPTIONS = POSITION_VALUES.map((v) => ({
  value: v,
  label: POSITION_LABELS[v],
}));

export default function UserDetailSheet({
  profile,
  pending,
  setPending,
  onClose,
  onSaved,
  onDirtyChange,
}: {
  profile: UserProfileEntity;
  pending: boolean;
  setPending: (v: boolean) => void;
  onClose: () => void;
  onSaved: (p: UserProfileEntity) => void;
  onDirtyChange?: (dirty: boolean) => void;
}) {
  const [form, setForm] = useState<ProfileForm>(() => profileToForm(profile));
  const snapRef = useRef(JSON.stringify(profileToForm(profile)));

  const [phoneStep, setPhoneStep] = useState<"idle" | "edit" | "code">("idle");
  const [phoneDigits, setPhoneDigits] = useState("");
  const [code, setCode] = useState("");

  useEffect(() => {
    const next = profileToForm(profile);
    setForm(next);
    snapRef.current = JSON.stringify(next);
  }, [profile]);

  const dirty = JSON.stringify(form) !== snapRef.current;

  useEffect(() => {
    onDirtyChange?.(dirty);
  }, [dirty, onDirtyChange]);

  const headerClose = () => {
    if (dirty) {
      const ok = window.confirm(
        "Есть несохранённые изменения. Закрыть без сохранения?",
      );
      if (!ok) return;
    }
    onClose();
  };

  const saveProfile = async () => {
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

  const sendPhoneChange = async () => {
    if (!phoneLooksValid(phoneDigits)) return;
    setPending(true);
    try {
      await apiJson("/api/users/send-code", {
        method: "POST",
        body: JSON.stringify({
          userId: profile.id,
          phone: `+${normalizePhoneDigits(phoneDigits)}`,
        }),
      });
      setPhoneStep("code");
      setCode("");
    } catch {
      window.alert("Ошибка отправки кода");
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
    } catch {
      window.alert("Неверный код");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="pointer-events-none absolute inset-0 z-40 flex items-stretch justify-start">
      <div className="pointer-events-auto flex h-full max-h-full min-h-0 w-[400px] flex-col overflow-y-auto rounded-br-l rounded-tr-l bg-background-none shadow-[0px_4px_16px_-4px_rgba(9,18,58,0.1)]">
        <ModalChromeHeader title="Пользователь" onClose={headerClose} />

        <div className="flex flex-col gap-4 px-8 pb-4 pt-4">
          <TextField
            label="Фамилия"
            value={form.surname}
            onChange={(e) =>
              setForm((f) => ({ ...f, surname: e.target.value }))
            }
          />
          <TextField
            label="Имя"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <TextField
            label="Отчество"
            value={form.middlename}
            onChange={(e) =>
              setForm((f) => ({ ...f, middlename: e.target.value }))
            }
          />

          <div className="flex flex-col gap-1">
            <span className="text-m text-symb-primary" id="detail-position-label">
              Должность
            </span>
            <DropdownSelect
              id="detail-user-position"
              aria-labelledby="detail-position-label"
              value={form.position}
              onChange={(v) =>
                setForm((f) => ({
                  ...f,
                  position: v as Position,
                }))
              }
              options={POSITION_OPTIONS}
            />
          </div>

          <div className="rounded-s bg-background-med px-4 py-3 text-m text-symb-primary">
            График: Пн–Пт {secondsToTimeLabel(form.weekdaysStart)}–
            {secondsToTimeLabel(form.weekdaysEnd)}
            {form.lunchStart !== undefined ? (
              <>
                , обед {secondsToTimeLabel(form.lunchStart)}–
                {secondsToTimeLabel(form.lunchEnd!)}
              </>
            ) : null}
          </div>

          <div className="flex flex-col gap-2 border-t border-stroke-med pt-4">
            <span className="text-m text-symb-primary">Телефон</span>
            <button
              type="button"
              className={`rounded-m px-4 py-3 text-left text-l ${
                profile.phoneVerified ? "bg-background-med" : "bg-background-error"
              }`}
              onClick={() => {
                setPhoneDigits(form.phoneDigits);
                setPhoneStep("edit");
              }}
            >
              {formatPhonePretty(form.phoneDigits)}
              {!profile.phoneVerified ? (
                <span className="mt-1 block text-m text-symb-error">
                  Требуется подтверждение
                </span>
              ) : null}
            </button>

            {phoneStep === "edit" ? (
              <div className="flex flex-col gap-2 rounded-m border border-stroke-med p-3">
                <input
                  className="rounded-m border border-stroke-med px-3 py-2 text-l"
                  value={formatPhonePretty(phoneDigits)}
                  onChange={(e) =>
                    setPhoneDigits(normalizePhoneDigits(e.target.value))
                  }
                />
                <Button
                  size="S"
                  variant="primary"
                  type="button"
                  disabled={!phoneLooksValid(phoneDigits) || pending}
                  onClick={() => void sendPhoneChange()}
                >
                  Отправить код
                </Button>
              </div>
            ) : null}

            {phoneStep === "code" ? (
              <div className="flex flex-col gap-2">
                <CodeInput value={code} onChange={setCode} />
                <Button
                  size="S"
                  variant="primary"
                  type="button"
                  disabled={code.length !== 4 || pending}
                  onClick={() => void confirmPhoneChange()}
                >
                  Подтвердить номер
                </Button>
              </div>
            ) : null}
          </div>
        </div>

        <ModalChromeFooter>
          <Button
            variant="primary"
            type="button"
            disabled={!dirty || pending}
            onClick={() => void saveProfile()}
          >
            Сохранить
          </Button>
        </ModalChromeFooter>
      </div>
    </div>
  );
}
