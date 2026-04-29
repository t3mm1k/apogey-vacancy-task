"use client";

import {
  ClipboardEventHandler,
  KeyboardEventHandler,
  useCallback,
  useRef,
} from "react";
import { cn } from "@shared/lib/utils/css";

export type CodeInputProps = {
  length?: number;
  value: string;
  onChange: (digits: string) => void;
  error?: boolean;
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
};

export default function CodeInput({
  length = 4,
  value,
  onChange,
  error,
  disabled,
  className,
  ariaLabel = "Код подтверждения",
}: CodeInputProps) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(length, " ").slice(0, length).split("");

  const focusAt = useCallback((i: number) => {
    refs.current[i]?.focus();
    refs.current[i]?.select();
  }, []);

  const apply = useCallback(
    (next: string) => {
      const cleaned = next.replace(/\D/g, "").slice(0, length);
      onChange(cleaned);
    },
    [length, onChange]
  );

  function makeKeyDown(index: number): KeyboardEventHandler<HTMLInputElement> {
    return (e) => {
      const emptyCell = !(value[index] ?? "").trim();
      if (e.key === "Backspace" && emptyCell && index > 0) {
        focusAt(index - 1);
      }
      if (e.key === "ArrowLeft" && index > 0) focusAt(index - 1);
      if (e.key === "ArrowRight" && index < length - 1) focusAt(index + 1);
    };
  }

  const onPaste: ClipboardEventHandler<HTMLInputElement> = (e) => {
    e.preventDefault();
    const t = e.clipboardData.getData("text");
    apply(t);
  };

  return (
    <div
      className={cn("flex gap-2", className)}
      role="group"
      aria-label={ariaLabel}
    >
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          disabled={disabled}
          maxLength={1}
          value={digits[i]?.trim() ?? ""}
          aria-invalid={error || undefined}
          className={cn(
            "box-border flex h-14 w-12 rounded-s border bg-background-none text-center text-[32px] leading-none outline-none transition-colors",
            "text-symb-primary caret-symb-primary",
            error
              ? "border-stroke-error text-symb-error"
              : "border-stroke-active enabled:hover:border-stroke-max focus:border-symb-secondary",
            disabled && "cursor-not-allowed opacity-60"
          )}
          onPaste={onPaste}
          onChange={(e) => {
            const raw = e.target.value.replace(/\D/g, "");
            const last = raw.slice(-1);
            const next =
              value.slice(0, i) + (last || "") + value.slice(i + 1);
            apply(next);
            if (last && i < length - 1) focusAt(i + 1);
          }}
          onKeyDown={makeKeyDown(i)}
        />
      ))}
    </div>
  );
}
