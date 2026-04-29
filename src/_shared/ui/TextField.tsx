import { forwardRef } from "react";
import { cn } from "@shared/lib/utils/css";

export interface TextFieldProps extends Omit<React.ComponentProps<"input">, "size"> {
  label?: string;
  error?: string;
  requiredMark?: boolean;
}

const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, error, requiredMark, className, id, disabled, ...props },
  ref
) {
  const inputId = id ?? props.name;
  const hasError = Boolean(error);

  return (
    <div
      className={cn(
        "flex w-full max-w-[400px] flex-col gap-1",
        label ? "min-h-[72px]" : "min-h-[48px]"
      )}
    >
      {label !== undefined && (
        <label htmlFor={inputId} className="text-m text-symb-primary">
          {label}
          {requiredMark ? <span className="text-stroke-error">*</span> : null}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        disabled={disabled}
        aria-invalid={hasError || undefined}
        className={cn(
          "box-border h-12 w-full rounded-m border bg-background-none px-4 py-3 text-l text-symb-primary outline-none transition-colors",
          "placeholder:text-symb-tertiary",
          hasError
            ? "border-stroke-error"
            : "border-stroke-med focus:border-symb-secondary disabled:border-stroke-min disabled:bg-background-med disabled:text-symb-disabled",
          className
        )}
        {...props}
      />
      {hasError ? (
        <p className="text-m text-symb-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
});

export default TextField;
