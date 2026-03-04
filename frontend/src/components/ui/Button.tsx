import clsx from "clsx";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  fullWidth?: boolean;
  iconLeft?: ReactNode;
};

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-[linear-gradient(180deg,#ff9d7f_0%,#f77b55_100%)] text-white border-[#e26945] focus-visible:ring-accent/40 shadow-md shadow-accent/30",
  secondary:
    "bg-[linear-gradient(180deg,#fefefe_0%,#e7ebff_100%)] text-ink border-[#7f8fbe]/70 focus-visible:ring-softBlue/40 shadow-md shadow-softBlue/20",
  ghost: "bg-[linear-gradient(180deg,#f9f9f9cc_0%,#ece9e3cc_100%)] text-ink border-[#7b696c] focus-visible:ring-ink/30",
  danger: "bg-[linear-gradient(180deg,#e27979_0%,#c94f4f_100%)] text-white border-[#b84242] focus-visible:ring-[#d05656]/40",
};

export const Button = ({
  variant = "primary",
  className,
  fullWidth = false,
  iconLeft,
  children,
  ...props
}: ButtonProps) => {
  return (
    <button
      data-variant={variant}
      className={clsx(
        "game-btn inline-flex h-11 items-center justify-center gap-2 rounded-full border px-5 text-sm font-black tracking-[0.04em] transition duration-200 focus-visible:outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-60",
        "hover:-translate-y-0.5 active:translate-y-0",
        variantStyles[variant],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      <span className="game-btn__label inline-flex w-full items-center justify-center gap-2">
        {iconLeft}
        {children}
      </span>
    </button>
  );
};
