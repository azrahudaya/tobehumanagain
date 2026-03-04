import clsx from "clsx";
import type { HTMLAttributes } from "react";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  glass?: boolean;
};

export const Card = ({ className, glass = false, ...props }: CardProps) => {
  return (
    <div
      className={clsx(
        "rounded-3xl border border-white/60 bg-white/85 p-5 shadow-glow backdrop-blur-sm",
        glass && "bg-white/65",
        className,
      )}
      {...props}
    />
  );
};
