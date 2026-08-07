import { useId } from "react";
import { cn } from "@/lib/utils";

type TradexoMarkProps = {
  className?: string;
  size?: number;
};

/** Tradexo "Exchange T" — bidirectional trade arrows + connection hub. */
export function TradexoMark({ className, size = 36 }: TradexoMarkProps) {
  const gradId = useId();

  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      className={cn("shrink-0", className)}
      aria-hidden
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF8533" />
          <stop offset="0.5" stopColor="#FF6C00" />
          <stop offset="1" stopColor="#E86200" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="11" fill={`url(#${gradId})`} />
      <path fill="#fff" d="M24 14v16" />
      <path fill="#fff" d="M14 22h20" />
      <path fill="#fff" d="M14 22l6-6 6 6" />
      <path fill="#fff" d="M34 22l-6-6-6 6" />
      <path fill="#fff" d="M14 22l-5 5 5 5h5l-5-5 5-5h-5z" />
      <path fill="#fff" d="M34 22l5 5-5 5h-5l5-5-5-5h5z" />
      <circle cx="17" cy="38" r="3.5" fill="#fff" />
      <circle cx="31" cy="38" r="3.5" fill="#fff" />
      <rect x="17" y="36.5" width="14" height="3" rx="1.5" fill="#fff" />
      <circle cx="24" cy="32" r="2.5" fill="#fff" />
    </svg>
  );
}
