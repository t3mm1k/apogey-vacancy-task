"use client";

import Button from "@shared/ui/Button";
import { cn } from "@shared/lib/utils/css";

export default function UnsavedChangesDialog({
  open,
  title = "Несохранённые изменения",
  message = "Есть несохранённые изменения. Закрыть без сохранения?",
  stayLabel = "Остаться",
  discardLabel = "Выйти без сохранения",
  onStay,
  onDiscard,
  className,
}: {
  open: boolean;
  title?: string;
  message?: string;
  stayLabel?: string;
  discardLabel?: string;
  onStay: () => void;
  onDiscard: () => void;
  className?: string;
}) {
  if (!open) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-60 flex items-center justify-center p-6",
        className,
      )}
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default bg-basic-max/40"
        aria-label={stayLabel}
        onClick={onStay}
      />
      <div
        className="relative flex w-full max-w-[400px] flex-col gap-6 rounded-l bg-background-none p-8 shadow-[0px_4px_16px_-4px_rgba(9,18,58,0.1)]"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="unsaved-dialog-title"
        aria-describedby="unsaved-dialog-desc"
      >
        <div className="flex flex-col gap-2">
          <h2
            id="unsaved-dialog-title"
            className="text-h2 text-symb-primary"
          >
            {title}
          </h2>
          <p id="unsaved-dialog-desc" className="text-m text-symb-secondary">
            {message}
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-3">
          <Button variant="tertiary" type="button" size="M" onClick={onStay}>
            {stayLabel}
          </Button>
          <Button variant="primary" type="button" size="M" onClick={onDiscard}>
            {discardLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
