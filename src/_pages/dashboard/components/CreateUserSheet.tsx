"use client";

import { useState } from "react";

import type { Position } from "@db/position";
import type { ScheduleInput } from "@db/user-schemas";
import type { UserProfileEntity } from "@db/types";

import Button from "@shared/ui/Button";
import CodeInput from "@shared/ui/CodeInput";
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
import WorkScheduleEditor from "./WorkScheduleEditor";
import WorkScheduleSummary from "./WorkScheduleSummary";

const POSITION_OPTIONS = POSITION_VALUES.map((v) => ({
  value: v,
  label: POSITION_LABELS[v],
}));

export type CreateDraft = {
  surname: string;
  name: string;
  middlename: string;
  position: Position | "";
  schedule: ScheduleInput | null;
  phoneDigits: string;
};

export function emptyDraft(): CreateDraft {
  return {
    surname: "",
    name: "",
    middlename: "",
    position: "",
    schedule: null,
    phoneDigits: "",
  };
}

export default function CreateUserSheet({
  draft,
  setDraft,
  step,
  setStep,
  pending,
  setPending,
  onClose,
  onConfirmed,
}: {
  draft: CreateDraft;
  setDraft: (d: CreateDraft) => void;
  step: "form" | "code";
  setStep: (s: "form" | "code") => void;
  pending: boolean;
  setPending: (v: boolean) => void;
  onClose: () => void;
  onConfirmed: () => Promise<void>;
}) {
  const [createdUserId, setCreatedUserId] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [scheduleEditorOpen, setScheduleEditorOpen] = useState(false);

  const validateForm = () => {
    const e: Record<string, string> = {};
    if (!draft.surname.trim()) e.surname = "Обязательное поле";
    if (!draft.name.trim()) e.name = "Обязательное поле";
    if (!draft.middlename.trim()) e.middlename = "Обязательное поле";
    if (!draft.position) e.position = "Обязательное поле";
    if (draft.schedule === null) e.schedule = "Обязательное поле";
    if (!phoneLooksValid(draft.phoneDigits)) {
      e.phone =
        normalizePhoneDigits(draft.phoneDigits).length === 0
          ? "Обязательное поле"
          : "Введите корректный номер телефона";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submitCreate = async () => {
    if (!validateForm()) return;
    setPending(true);
    try {
      const body = {
        surname: draft.surname.trim(),
        name: draft.name.trim(),
        middlename: draft.middlename.trim(),
        position: draft.position as Position,
        phone: `+${normalizePhoneDigits(draft.phoneDigits)}`,
        schedule: draft.schedule!,
      };
      const profile = await apiJson<UserProfileEntity>("/api/users", {
        method: "POST",
        body: JSON.stringify(body),
      });
      setCreatedUserId(profile.id);
      await apiJson("/api/users/send-code", {
        method: "POST",
        body: JSON.stringify({
          userId: profile.id,
          phone: body.phone,
        }),
      });
      setStep("code");
      setCode("");
    } catch {
      window.alert("Не удалось создать пользователя");
    } finally {
      setPending(false);
    }
  };

  const submitCode = async () => {
    if (!createdUserId) return;
    setPending(true);
    try {
      await apiJson<UserProfileEntity>("/api/users/confirm-code", {
        method: "POST",
        body: JSON.stringify({
          userId: createdUserId,
          phone: `+${normalizePhoneDigits(draft.phoneDigits)}`,
          code,
        }),
      });
      await onConfirmed();
    } catch {
      window.alert("Неверный код");
    } finally {
      setPending(false);
    }
  };

  const canContinue =
    Boolean(
      draft.surname.trim() &&
        draft.name.trim() &&
        draft.middlename.trim() &&
        draft.position &&
        draft.schedule !== null &&
        phoneLooksValid(draft.phoneDigits),
    );

  return (
    <div className="pointer-events-none absolute inset-0 z-40 flex items-stretch justify-start">
      <div className="pointer-events-auto flex h-full min-h-0 flex-row items-stretch gap-0 overflow-hidden rounded-br-l rounded-tr-l bg-background-none shadow-[0px_4px_16px_-4px_rgba(9,18,58,0.1)]">
        <div
          className="flex h-full min-h-0 w-[400px] shrink-0 flex-col bg-background-none"
          role="dialog"
          aria-modal="true"
        >
          {step === "form" ? (
            scheduleEditorOpen ? (
              <WorkScheduleEditor
                initial={draft.schedule}
                onBack={() => setScheduleEditorOpen(false)}
                onSave={(s) => {
                  setDraft({ ...draft, schedule: s });
                  setScheduleEditorOpen(false);
                  setErrors((err) => {
                    const next = { ...err };
                    delete next.schedule;
                    return next;
                  });
                }}
              />
            ) : (
            <>
              <ModalChromeHeader title="Новый пользователь" onClose={onClose} />
              <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-8 pb-6 pt-4">
                <div className="flex flex-col gap-3">
                  <TextField
                    name="surname"
                    placeholder="Фамилия"
                    aria-label="Фамилия"
                    value={draft.surname}
                    onChange={(e) =>
                      setDraft({ ...draft, surname: e.target.value })
                    }
                    error={errors.surname}
                  />
                  <TextField
                    name="name"
                    placeholder="Имя"
                    aria-label="Имя"
                    value={draft.name}
                    onChange={(e) =>
                      setDraft({ ...draft, name: e.target.value })
                    }
                    error={errors.name}
                  />
                  <TextField
                    name="middlename"
                    placeholder="Отчество"
                    aria-label="Отчество"
                    value={draft.middlename}
                    onChange={(e) =>
                      setDraft({ ...draft, middlename: e.target.value })
                    }
                    error={errors.middlename}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <DropdownSelect
                    id="create-user-position"
                    aria-label="Должность"
                    value={draft.position}
                    onChange={(v) =>
                      setDraft({
                        ...draft,
                        position: v as Position | "",
                      })
                    }
                    options={POSITION_OPTIONS}
                    placeholder="Выберите должность"
                    invalid={Boolean(errors.position)}
                  />
                  {errors.position ? (
                    <span className="text-m text-symb-error">
                      {errors.position}
                    </span>
                  ) : null}
                </div>

                <div className="flex flex-col gap-1">
                  {draft.schedule === null ? (
                    <>
                      <button
                        type="button"
                        className={`flex w-full items-center justify-between gap-3 rounded-s bg-background-med px-4 py-3 text-left text-l text-symb-secondary transition-colors hover:brightness-[0.99] ${
                          errors.schedule ? "border border-stroke-error" : ""
                        }`}
                        onClick={() => setScheduleEditorOpen(true)}
                      >
                        <span>Укажите график работы</span>
                        <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-s bg-background-none">
                          <Icon name="chevron_forward" size={24} />
                        </span>
                      </button>
                      {errors.schedule ? (
                        <span className="text-m text-symb-error">
                          {errors.schedule}
                        </span>
                      ) : null}
                    </>
                  ) : (
                    <WorkScheduleSummary
                      schedule={draft.schedule}
                      onEdit={() => setScheduleEditorOpen(true)}
                    />
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="create-user-phone"
                    className="flex flex-col gap-1"
                  >
                    <span className="text-m text-symb-primary">Номер телефона*</span>
                    <input
                      id="create-user-phone"
                      className={`box-border h-12 w-full rounded-m border bg-background-none px-4 py-3 text-l text-symb-primary outline-none transition-colors placeholder:text-symb-tertiary ${
                        errors.phone
                          ? "border-stroke-error"
                          : "border-stroke-med focus:border-symb-secondary"
                      }`}
                      inputMode="tel"
                      autoComplete="tel"
                      placeholder="+ 7 (000) 000–00–00"
                      value={formatPhonePretty(draft.phoneDigits)}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          phoneDigits: normalizePhoneDigits(e.target.value),
                        })
                      }
                    />
                    {errors.phone ? (
                      <span className="text-m text-symb-error">{errors.phone}</span>
                    ) : (
                      <span className="text-s text-symb-tertiary">
                        Вышлем SMS-код. Без подтверждения пользователь не будет
                        добавлен
                      </span>
                    )}
                  </label>
                </div>
              </div>

              <ModalChromeFooter>
                <Button
                  variant="primary"
                  size="M"
                  type="button"
                  disabled={!canContinue || pending}
                  className={
                    !canContinue || pending
                      ? "bg-background-max text-symb-secondary hover:bg-background-max disabled:bg-background-max"
                      : ""
                  }
                  onClick={() => void submitCreate()}
                >
                  Продолжить
                </Button>
              </ModalChromeFooter>
            </>
            )
          ) : (
            <>
              <ModalChromeHeader title="Новый пользователь" onClose={onClose} />
              <div className="flex min-h-0 flex-1 flex-col px-8 pb-6 pt-4">
                <p className="text-m text-symb-secondary">
                  Данные сохранены. Подтвердите номер в соседней панели — код из
                  SMS (для теста:{" "}
                  <strong className="text-symb-primary">1111</strong>).
                </p>
              </div>
            </>
          )}
        </div>

        {step === "code" ? (
          <div className="flex h-full min-h-0 w-[320px] shrink-0 flex-col border-l border-stroke-min bg-background-none">
            <ModalChromeHeader title="Подтверждение телефона" onClose={onClose} />
            <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-8 pb-6 pt-4">
              <p className="text-m text-symb-secondary">
                Введите код из SMS (тестовый код:{" "}
                <strong className="text-symb-primary">1111</strong>)
              </p>
              <CodeInput value={code} onChange={setCode} />
            </div>
            <ModalChromeFooter className="rounded-none rounded-br-l rounded-tr-none">
              <Button
                variant="primary"
                size="M"
                type="button"
                disabled={code.length !== 4 || pending}
                onClick={() => void submitCode()}
              >
                Подтвердить
              </Button>
            </ModalChromeFooter>
          </div>
        ) : null}
      </div>
    </div>
  );
}
