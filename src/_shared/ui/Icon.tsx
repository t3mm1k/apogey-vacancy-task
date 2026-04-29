import { cn } from "@shared/lib/utils/css";

export type IconProps = {
  name: string;
  className?: string;
  size?: 16 | 20 | 24;
  filled?: boolean;
};

export default function  Icon({ name, className, size = 20, filled }: IconProps) {
  const sizeClass = size === 16 ? "text-[16px]" : size === 24 ? "text-[24px]" : "text-[20px]";
  return (
    <span
      className={cn(
        "icon inline-flex shrink-0 items-center justify-center leading-none",
        filled && "icon-fill",
        sizeClass,
        className
      )}
      aria-hidden
    >
      {name}
    </span>
  );
}
