import { cn } from "@shared/lib/utils/css";
import Icon from "@shared/ui/Icon";

export type UserRowProps = {
  name: string;
  confirmed: boolean;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
};

export default function UserRow({
  name,
  confirmed,
  className,
  onClick,
  disabled,
}: UserRowProps) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      disabled={onClick ? disabled : undefined}
      className={cn(
        "flex w-full items-center gap-2 rounded-m py-3 pl-4 pr-3 text-left text-m text-symb-primary",
        confirmed ? "bg-background-med" : "bg-background-error",
        onClick &&
          !disabled &&
          "cursor-pointer transition-colors hover:brightness-[0.99]",
        disabled && "cursor-not-allowed opacity-60",
        className,
      )}
    >
      <span className="min-w-0 flex-1 truncate">{name}</span>
      {!confirmed ? (
        <span className="inline-flex shrink-0" aria-hidden>
          <Icon name="error" className="text-symb-primary" />
        </span>
      ) : null}
    </Tag>
  );
}
