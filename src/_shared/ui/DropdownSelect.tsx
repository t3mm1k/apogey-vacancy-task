"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";

import { cn } from "@shared/lib/utils/css";

import Icon from "./Icon";

export type DropdownOption = { value: string; label: string };

export type DropdownSelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  placeholder?: string;
  id?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  invalid?: boolean;
  disabled?: boolean;
  className?: string;
  tone?: "outline" | "filled";
  layout?: "default" | "time";
};

export default function DropdownSelect({
  value,
  onChange,
  options,
  placeholder = "Выберите значение",
  id: idProp,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  invalid,
  disabled,
  className,
  tone = "outline",
  layout = "default",
}: DropdownSelectProps) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const listId = `${id}-listbox`;
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);
  const triggerLabel = selected?.label ?? placeholder;

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) close();
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open, close]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  return (
    <div ref={rootRef} className={cn("relative w-full", className)}>
      <button
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={ariaLabelledBy ? undefined : ariaLabel}
        aria-labelledby={ariaLabelledBy}
        onClick={() => !disabled && setOpen((o) => !o)}
        className={cn(
          "box-border flex w-full items-center text-left outline-none transition-colors",
          layout === "time" &&
            tone === "outline" &&
            cn(
              "h-10 justify-center rounded-s border bg-background-none px-2 py-2 text-l text-symb-primary focus:border-symb-secondary",
              invalid ? "border-stroke-error" : "border-stroke-med",
            ),
          layout !== "time" &&
            tone === "outline" &&
            "h-12 rounded-m border bg-background-none px-4 py-3 pr-12 text-l",
          tone === "filled" &&
            "h-10 w-full min-w-0 rounded-m bg-background-med px-4 py-2 pr-10 text-m text-symb-primary",
          layout !== "time" &&
            tone === "outline" &&
            (value ? "text-symb-primary" : "text-symb-tertiary"),
          layout !== "time" &&
            tone === "outline" &&
            (invalid
              ? "border-stroke-error"
              : "border-stroke-med focus:border-symb-secondary"),
          tone === "filled" &&
            (invalid ? "ring-2 ring-stroke-error" : "border-0 focus-visible:ring-2 focus-visible:ring-stroke-active"),
          disabled && "cursor-not-allowed opacity-60",
        )}
      >
        <span
          className={cn(
            "min-w-0 flex-1 truncate",
            layout === "time" && "text-center",
          )}
        >
          {triggerLabel}
        </span>
      </button>
      {tone === "outline" && layout !== "time" ? (
        <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center justify-center text-symb-secondary">
          <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-s bg-background-none">
            <Icon name="keyboard_arrow_down" size={24} />
          </span>
        </span>
      ) : tone === "filled" ? (
        <span className="pointer-events-none absolute inset-y-0 right-1.5 flex items-center justify-center">
          <span className="inline-flex items-center justify-center rounded-s bg-background-med p-1 text-symb-secondary">
            <Icon name="unfold_more" size={20} />
          </span>
        </span>
      ) : null}

      {open ? (
        <ul
          id={listId}
          role="listbox"
          aria-labelledby={ariaLabelledBy ?? id}
          className={cn(
            "absolute left-0 right-0 top-[calc(100%+4px)] z-50 flex max-h-[min(220px,45vh)] flex-col gap-0 overflow-y-auto rounded-m border border-stroke-min bg-background-none p-1 shadow-[0px_4px_16px_-4px_rgba(9,18,58,0.1)]",
            "[scrollbar-width:thin] [scrollbar-color:var(--color-stroke-med)_transparent]",
            "[&::-webkit-scrollbar]:w-[7px]",
            "[&::-webkit-scrollbar-thumb]:rounded-s [&::-webkit-scrollbar-thumb]:bg-stroke-med",
          )}
        >
          {options.map((o) => {
            const isSelected = o.value === value;
            return (
              <li key={o.value} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={cn(
                    "w-full rounded-s px-3 py-2 text-left text-m text-symb-primary transition-colors",
                    isSelected ? "bg-background-med" : "bg-background-none hover:bg-background-min",
                  )}
                  onClick={() => {
                    onChange(o.value);
                    close();
                  }}
                >
                  {o.label}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
