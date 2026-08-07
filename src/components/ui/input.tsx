import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef, useId } from "react";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  /** Visible label rendered above the input. */
  label?: string;
  /** Inline error message rendered below the input (replaces hint when set). */
  error?: string;
  /** Helper/hint text rendered below the input. */
  hint?: string;
  /** Appends a red asterisk to the label. */
  required?: boolean;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, required, id, ...props }, ref) => {
    // Generate a stable id so the <label> can always reference the <input>.
    const generatedId = useId();
    const inputId = id ?? generatedId;

    const helpText = error ?? hint;
    const helpId = helpText ? `${inputId}-help` : undefined;

    return (
      <div className="flex w-full flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-neutral-700 leading-none"
          >
            {label}
            {required && (
              <span className="ml-0.5 text-red-500" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}

        <input
          ref={ref}
          id={inputId}
          required={required}
          aria-required={required}
          aria-describedby={helpId}
          aria-invalid={error ? true : undefined}
          className={cn(
            // base
            "h-10 w-full rounded-lg border bg-white px-3 text-sm text-neutral-900",
            "placeholder:text-neutral-400 outline-none transition-colors duration-200",
            // default border
            "border-neutral-300",
            // focus
            "focus:border-[#FF6C00] focus:ring-2 focus:ring-[#FF6C00]/20",
            // error override
            error &&
              "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20",
            // disabled
            "disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-400",
            className
          )}
          {...props}
        />

        {helpText && (
          <p
            id={helpId}
            className={cn(
              "text-xs leading-tight",
              error ? "text-red-600" : "text-neutral-500"
            )}
          >
            {helpText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
