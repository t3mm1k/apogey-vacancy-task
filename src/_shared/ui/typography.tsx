import type { ReactNode } from "react";
import { cn } from "@shared/lib/utils/css";

type TextProps = {
  children: ReactNode;
  className?: string;
};

export function H0({ children, className }: TextProps) {
  return (
    <p className={cn("text-[32px] leading-[1.2] tracking-tight text-symb-primary", className)}>
      {children}
    </p>
  );
}

export function H1({ children, className }: TextProps) {
  return <p className={cn("text-h1 text-symb-primary", className)}>{children}</p>;
}

export function H2({ children, className }: TextProps) {
  return <p className={cn("text-h2 text-symb-primary", className)}>{children}</p>;
}

export function BodyL({ children, className }: TextProps) {
  return <p className={cn("text-l text-symb-primary", className)}>{children}</p>;
}

export function BodyM({ children, className }: TextProps) {
  return <p className={cn("text-m text-symb-primary", className)}>{children}</p>;
}

export function BodyS({ children, className }: TextProps) {
  return <p className={cn("text-s text-symb-primary", className)}>{children}</p>;
}

export function BodyXs({ children, className }: TextProps) {
  return <p className={cn("text-xs text-symb-primary", className)}>{children}</p>;
}

export function MetaCaption({ children, className }: TextProps) {
  return (
    <p className={cn("text-s tracking-wide text-symb-secondary", className)}>
      {children}
    </p>
  );
}
