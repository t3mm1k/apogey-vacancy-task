import { cn } from "@shared/lib/utils/css";

function UserRowSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex w-full items-center gap-2 rounded-m bg-background-med py-3 pl-4 pr-3",
        className,
      )}
      aria-hidden
    >
      <div className="h-4 min-w-0 flex-1 animate-pulse rounded-xs bg-background-max/35" />
      <div className="size-5 shrink-0 animate-pulse rounded-full bg-background-max/25" />
    </div>
  );
}

export default function UserListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div
      className="flex flex-col gap-2"
      aria-busy="true"
      aria-live="polite"
      aria-label="Загрузка списка пользователей"
    >
      {Array.from({ length: count }).map((_, i) => (
        <UserRowSkeleton key={i} />
      ))}
    </div>
  );
}
