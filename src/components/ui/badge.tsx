import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

export type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "premium"
  | "new"
  | "outline";

const styles: Record<BadgeVariant, string> = {
  /** Neutral default — subdued grey */
  default: "bg-neutral-100 text-neutral-700",

  /** Green — positive status, verified, active */
  success: "bg-[#DCFCE7] text-[#16A34A] ring-1 ring-[#16A34A]/20",

  /** Amber — pending, in-progress, caution */
  warning: "bg-[#FEF3C7] text-[#D97706] ring-1 ring-[#D97706]/20",

  /** Red — error, rejected, inactive */
  danger: "bg-[#FEE2E2] text-[#DC2626] ring-1 ring-[#DC2626]/20",

  /** Blue — informational */
  info: "bg-[#DBEAFE] text-[#2563EB] ring-1 ring-[#2563EB]/20",

  /** Brand gradient — featured, sponsored, paid tier */
  premium:
    "bg-gradient-to-r from-[#E86200] to-[#FF6C00] text-white shadow-sm",

  /** Orange-tinted highlight — newly added items */
  new: "bg-[#F0F0F0] text-[#FF6C00] ring-1 ring-[#FF6C00]/30",

  /** Bordered, no fill */
  outline: "border border-neutral-300 text-neutral-600 bg-white",
};

export function Badge({
  className,
  variant = "default",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold leading-none",
        styles[variant],
        className
      )}
      {...props}
    />
  );
}
