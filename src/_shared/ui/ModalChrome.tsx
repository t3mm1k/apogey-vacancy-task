import type { ReactNode } from "react";
import { cn } from "@shared/lib/utils/css";
import Icon from "@shared/ui/Icon";

export type ModalChromeHeaderProps = {
  title: string;
  onBack?: () => void;
  onClose?: () => void;
  className?: string;
};

export function ModalChromeHeader({
  title,
  onBack,
  onClose,
  className,
}: ModalChromeHeaderProps) {
  return (
    <header
      className={cn(
        "flex w-full max-w-none items-center gap-3 rounded-tl-l rounded-tr-l bg-background-none px-8 pb-5 pt-8",
        className
      )}
    >
      <div className="flex w-11 shrink-0 justify-start">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center justify-center rounded-m bg-background-med px-3 py-2 text-symb-secondary transition-colors hover:bg-background-max"
            aria-label="Назад"
          >
            <Icon name="keyboard_backspace" className="text-symb-secondary" />
          </button>
        ) : null}
      </div>
      <h2 className="min-w-0 flex-1 text-center text-h2 text-symb-primary">{title}</h2>
      <div className="flex w-11 shrink-0 justify-end">
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-9 items-center justify-center rounded-m  bg-background-med p-2 text-symb-secondary transition-colors hover:bg-background-max"
            aria-label="Закрыть"
          >
            <Icon name="close" className="text-symb-secondary" />
          </button>
        ) : null}
      </div>
    </header>
  );
}

export type ModalChromeFooterProps = {
  children: ReactNode;
  className?: string;
};

export function ModalChromeFooter({ children, className }: ModalChromeFooterProps) {
  return (
    <footer
      className={cn(
        "flex w-full max-w-none flex-wrap items-center justify-end gap-5 rounded-bl-xl rounded-br-xl bg-background-none px-8 pb-8 pt-5",
        className
      )}
    >
      {children}
    </footer>
  );
}
