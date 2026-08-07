"use client";

import Link from "next/link";
import { AnchorHTMLAttributes, ButtonHTMLAttributes, forwardRef } from "react";
import { buttonClassName } from "./button-utils";

type Variant =
  | "primary"
  | "brand"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger"
  | "call";

type Size = "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  href?: string;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading,
      disabled,
      children,
      href,
      type = "button",
      onClick,
      ...props
    },
    ref
  ) => {
    const classes = buttonClassName({ variant, size, className });

    const spinner = loading ? (
      <span
        aria-hidden="true"
        className="h-4 w-4 animate-spin rounded-full border-2 border-current/30 border-t-current"
      />
    ) : null;

    if (href) {
      return (
        <Link
          href={href}
          className={classes}
          onClick={
            onClick as AnchorHTMLAttributes<HTMLAnchorElement>["onClick"]
          }
        >
          {spinner}
          {children}
        </Link>
      );
    }

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        aria-disabled={disabled || loading}
        className={classes}
        onClick={onClick}
        {...props}
      >
        {spinner}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

// Re-export for backward compatibility
export { buttonClassName } from "./button-utils";
