import clsx from "clsx";
import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

type TextInputProps = InputHTMLAttributes<HTMLInputElement>;

type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export const TextInput = ({ className, ...props }: TextInputProps) => {
  return (
    <input
      className={clsx(
        "h-11 w-full rounded-2xl border border-[#c7c2bc] bg-white px-4 text-sm text-ink outline-none transition focus:border-softBlue focus:ring-4 focus:ring-softBlue/20",
        className,
      )}
      {...props}
    />
  );
};

export const TextArea = ({ className, ...props }: TextAreaProps) => {
  return (
    <textarea
      className={clsx(
        "min-h-24 w-full rounded-2xl border border-[#c7c2bc] bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-softBlue focus:ring-4 focus:ring-softBlue/20",
        className,
      )}
      {...props}
    />
  );
};
