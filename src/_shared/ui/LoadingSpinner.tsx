import { cn } from "@shared/lib/utils/css";

export type LoadingSpinnerProps = {
  className?: string;
  size?: number;
  "aria-label"?: string;
};

export default function LoadingSpinner({
  className,
  size = 40,
  "aria-label": ariaLabel = "Загрузка",
}: LoadingSpinnerProps) {
  return (
    <div
      role="status"
      aria-label={ariaLabel}
      className={cn("inline-flex shrink-0", className)}
      style={{ width: size, height: size }}
    >
      <span
        className="box-border block size-full animate-spin rounded-full border-2 border-stroke-med border-t-symb-primary"
        aria-hidden
      />
    </div>
  );
}
