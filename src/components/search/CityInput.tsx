"use client";

import { Loader2, MapPin, Navigation } from "lucide-react";
import { cn } from "@/lib/utils";

interface CityInputProps {
  value: string;
  onChange: (value: string) => void;
  onDetect?: () => void;
  detecting?: boolean;
  wasAutoDetected?: boolean;
  className?: string;
  inputClassName?: string;
  showDetectButton?: boolean;
  placeholder?: string;
}

export function CityInput({
  value,
  onChange,
  onDetect,
  detecting,
  wasAutoDetected,
  className,
  inputClassName,
  showDetectButton = true,
  placeholder,
}: CityInputProps) {
  return (
    <div className={cn("relative flex items-center gap-1", className)}>
      <div className="relative min-w-0 flex-1">
        <MapPin className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || (detecting ? "Detecting city..." : "City")}
          className={cn(
            "h-9 w-full bg-transparent pl-8 pr-2 text-sm outline-none placeholder:text-slate-400",
            inputClassName
          )}
        />
      </div>
      {showDetectButton && onDetect && (
        <button
          type="button"
          onClick={onDetect}
          disabled={detecting}
          title="Detect my city"
          className="text-jd-brand shrink-0 rounded-lg p-1.5 transition hover:bg-jd-brand-light disabled:opacity-50"
        >
          {detecting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Navigation className="h-4 w-4" />
          )}
        </button>
      )}
      {wasAutoDetected && value && (
        <span className="text-jd-brand absolute -bottom-5 left-0 hidden text-[10px] sm:block">
          Detected: {value}
        </span>
      )}
    </div>
  );
}
