import { cn } from "@/lib/utils";

type Variant =
  | "primary"
  | "brand"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger"
  | "call";

type Size = "sm" | "md" | "lg";

// "brand" is an explicit alias for "primary" — both map to the orange CTA style.
const variants: Record<Variant, string> = {
  primary:
    "bg-[#FF6C00] text-white shadow-sm font-semibold " +
    "hover:bg-[#E86200] active:bg-[#CC5800] active:scale-[0.98] " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6C00]/50 focus-visible:ring-offset-2 " +
    "disabled:bg-[#FF6C00]/50 disabled:shadow-none",

  brand:
    "bg-[#FF6C00] text-white shadow-sm font-semibold " +
    "hover:bg-[#E86200] active:bg-[#CC5800] active:scale-[0.98] " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6C00]/50 focus-visible:ring-offset-2 " +
    "disabled:bg-[#FF6C00]/50 disabled:shadow-none",

  secondary:
    "bg-white text-[#FF6C00] border border-[#FF6C00] shadow-sm font-semibold " +
    "hover:bg-[#F0F0F0] active:scale-[0.98] " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6C00]/50 focus-visible:ring-offset-2 " +
    "disabled:opacity-50 disabled:shadow-none",

  call:
    "bg-[#FF6C00] text-white shadow-sm font-semibold " +
    "hover:bg-[#E86200] active:bg-[#CC5800] active:scale-[0.98] " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6C00]/50 focus-visible:ring-offset-2 " +
    "disabled:bg-[#FF6C00]/50 disabled:shadow-none",

  outline:
    "border border-neutral-300 bg-white text-neutral-700 " +
    "hover:border-[#FF6C00] hover:text-[#FF6C00] active:scale-[0.98] " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-300 focus-visible:ring-offset-2 " +
    "disabled:opacity-50",

  ghost:
    "text-neutral-700 " +
    "hover:bg-[#F0F0F0] hover:text-[#FF6C00] active:scale-[0.98] " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6C00]/30 focus-visible:ring-offset-2 " +
    "disabled:opacity-50",

  danger:
    "bg-red-600 text-white shadow-sm font-semibold " +
    "hover:bg-red-700 active:bg-red-800 active:scale-[0.98] " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/50 focus-visible:ring-offset-2 " +
    "disabled:bg-red-600/50 disabled:shadow-none",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3 text-sm gap-1.5",
  md: "h-10 px-5 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2",
};

export function buttonClassName({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: Variant;
  size?: Size;
  className?: string;
}) {
  return cn(
    "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200",
    "disabled:cursor-not-allowed",
    variants[variant],
    sizes[size],
    className
  );
}
