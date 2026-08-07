"use client";

import { X } from "lucide-react";
import { useEffect, useId, useRef } from "react";
import { cn } from "@/lib/utils";

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ open, onClose, title, children, className }: ModalProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    // Lock body scroll
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Focus first focusable element inside dialog on next paint
    const frame = requestAnimationFrame(() => {
      const first = dialogRef.current?.querySelector<HTMLElement>(FOCUSABLE);
      first?.focus();
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }

      // Focus trap — cycle only within dialog
      if (e.key !== "Tab") return;
      const nodes = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []
      ).filter((el) => !el.closest("[aria-hidden]"));
      if (!nodes.length) return;

      const first = nodes[0];
      const last = nodes[nodes.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      cancelAnimationFrame(frame);
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    /*
     * Outer wrapper: full-screen overlay with flex centering.
     * aria-hidden is set to "false" while open so assistive tech
     * announces the dialog.
     */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-hidden="false"
    >
      {/* Backdrop — click outside to close */}
      <button
        type="button"
        aria-label="Close modal"
        tabIndex={-1}
        className="absolute inset-0 bg-neutral-950/60 backdrop-blur-sm transition-opacity duration-150"
        onClick={onClose}
      />

      {/* Dialog panel */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        className={cn(
          // Sizing — responsive width, reasonable height cap
          "relative z-10 w-full max-w-[90vw] lg:max-w-lg max-h-[90vh]",
          "flex flex-col",
          // Shape & surface
          "rounded-2xl bg-white shadow-2xl",
          // Entry animation: scale from 0.95 + fade in
          "animate-[modalIn_150ms_ease-out_both]",
          className
        )}
      >
        {/* Header */}
        {title && (
          <div className="flex shrink-0 items-center justify-between border-b border-neutral-100 px-6 py-4">
            <h2
              id={titleId}
              className="text-lg font-semibold text-neutral-900 leading-snug"
            >
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className={cn(
                "rounded-lg p-1.5 text-neutral-400 transition-colors duration-150",
                "hover:bg-neutral-100 hover:text-neutral-700",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-300"
              )}
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        )}

        {/* Scrollable body */}
        <div className="overflow-y-auto p-6">{children}</div>
      </div>

      {/*
       * Keyframe definition injected via a style tag so this component
       * is self-contained without requiring a global CSS file change.
       */}
      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.95); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
