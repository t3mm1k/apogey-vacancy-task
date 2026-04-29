"use client";

import { cn } from "@shared/lib/utils/css";
import Button from "@shared/ui/Button";
import CodeInput from "@shared/ui/CodeInput";
import { ModalChromeHeader } from "@shared/ui/ModalChrome";

import { formatMmSs } from "../lib/phone";

export type PhoneCodeConfirmPanelProps = {
  phoneLine: string;
  code: string;
  codeError: boolean;
  onCodeChange: (digits: string) => void;
  onBack: () => void;
  onConfirm: () => void | Promise<void>;
  pending: boolean;
  onClose?: () => void;
  resend?: {
    onResend: () => void;
    secondsLeft: number;
  };
  className?: string;
};

export default function PhoneCodeConfirmPanel({
  phoneLine,
  code,
  codeError,
  onCodeChange,
  onBack,
  onConfirm,
  pending,
  onClose,
  resend,
  className,
}: PhoneCodeConfirmPanelProps) {
  return (
    <div
      className={cn(
        "flex min-h-0 flex-1 flex-col bg-background-none",
        className,
      )}
    >
      <ModalChromeHeader
        title="Подтвердить номер"
        onBack={onBack}
        onClose={onClose}
        className="pt-10 pb-4"
      />
      <div className="flex min-h-0 flex-1 flex-col items-center gap-8 overflow-y-auto px-6 pb-20 pt-4">
        <p className="w-full text-center text-l leading-[1.4] text-symb-primary">
          Отправили код подтверждения
          <br />
          на номер <span className="whitespace-nowrap">{phoneLine}</span>
        </p>
        <div className="flex w-full max-w-[280px] flex-col items-stretch gap-8">
          <CodeInput
            value={code}
            onChange={onCodeChange}
            error={codeError}
            className="justify-center gap-2"
            ariaLabel="Код из SMS"
          />
          <div className="flex flex-col gap-3">
            <Button
              variant="primary"
              size="M"
              type="button"
              disabled={code.length !== 4 || pending}
              className="w-full justify-center"
              onClick={() => void onConfirm()}
            >
              Подтвердить
            </Button>
            {codeError && resend ? (
              <button
                type="button"
                disabled={resend.secondsLeft > 0 || pending}
                onClick={() => void resend.onResend()}
                className="flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-m border border-stroke-med bg-background-med px-4 py-2.5 text-m text-symb-tertiary outline-none transition-colors disabled:cursor-not-allowed disabled:opacity-90"
              >
                <span>Отправить код снова</span>
                {resend.secondsLeft > 0 ? (
                  <span className="tabular-nums text-symb-tertiary">
                    {formatMmSs(resend.secondsLeft)}
                  </span>
                ) : null}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
