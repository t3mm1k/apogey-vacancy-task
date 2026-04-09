import { MouseEventHandler } from "react";
import { cn } from "@shared/lib/utils/css";

export interface ButtonProps extends React.ComponentProps<"button"> {
  variant?: "primary" | "tertiary" | "default";
  size?: 'L' | 'M' | 'S';
  onClick?: MouseEventHandler<HTMLButtonElement>;
  children: React.ReactNode;
  className?: string
}

export default function Button({ variant = "default", size = "M", onClick, children, className, ...props }: ButtonProps) {
  const type = props?.type || "button"
  const variants = {
    primary: "bg-basic-max text-symb-inverse disabled:bg-background-max disabled:text-symb-tertiary antialiased",
    tertiary: "bg-background-none text-symb-primary border border-stroke-med [&_i]:text-symb-secondary hover:border-stroke-max disabled:border-stroke-min disabled:text-symb-tertiary disabled:[&_i]:text-neutral-med",
    default: ""
  };
  const sizes = {
    L: "text-l h-12 rounded-m px-4 py-3",
    M: "text-m h-10 rounded-m px-4 py-2.5",
    S: "text-s h-8 rounded-m px-3 py-2"
  }

  return (
    <button onClick={onClick}
      className={cn(
        "flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed outline-none",
        "transition-colors duration-300 ease-in-out place-content-center",
        sizes[size],
        variants[variant],
        className
      )}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
}