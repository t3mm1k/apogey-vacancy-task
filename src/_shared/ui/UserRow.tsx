import { cn } from "@shared/lib/utils/css";
import Icon from "@shared/ui/Icon";

export type UserRowProps = {
  name: string;
  confirmed: boolean;
  className?: string;
  onClick?: () => void;
};

export default function UserRow({
  name,
  confirmed,
  className,
  onClick,
}: UserRowProps) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "flex w-full max-w-[312px] items-center gap-2 rounded-l py-3 pl-4 pr-3 text-left text-m text-symb-primary",
        confirmed ? "bg-background-med" : "bg-background-error",
        onClick && "cursor-pointer transition-colors hover:brightness-[0.99]",
        className
      )}
    >
      <span className="min-w-0 flex-1 truncate">{name}</span>
      {(onClick || !confirmed) && (
      <span
        className={cn(
          "inline-flex shrink-0 rounded-s p-1",
          confirmed ? "bg-background-none" : "bg-background-none"
        )}
        aria-hidden
      >
        <Icon
          name={confirmed ? "chevron_forward" : "error"}
          className={confirmed ? "text-symb-secondary" : "text-symb-error"}
        />
      </span>
      )}
    </Tag>
  );
}
