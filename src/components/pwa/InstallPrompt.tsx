"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    const dismissed = localStorage.getItem("pwa_install_dismissed");
    if (dismissed) return;

    const handler = (event: Event) => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!visible || !deferred) return null;

  const install = async () => {
    await deferred.prompt();
    const choice = await deferred.userChoice;
    setVisible(false);
    setDeferred(null);
    if (choice.outcome === "dismissed") {
      localStorage.setItem("pwa_install_dismissed", "1");
    }
  };

  return (
    <div className="fixed bottom-[5.5rem] left-3 right-3 z-50 md:bottom-6 md:left-auto md:right-6 md:max-w-sm">
      <div className="flex items-start gap-3 rounded-2xl border border-[#d4d4d4] bg-white p-4 shadow-xl">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#ff6c00] text-white">
          <Download className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-slate-900">Install Tradexo App</p>
          <p className="mt-1 text-sm text-slate-600">
            Add to home screen for faster search, RFQ and supplier access.
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={install}
              className="rounded-lg bg-[#ff6c00] px-3 py-1.5 text-sm font-medium text-white"
            >
              Install
            </button>
            <button
              type="button"
              onClick={() => {
                setVisible(false);
                localStorage.setItem("pwa_install_dismissed", "1");
              }}
              className="rounded-lg px-3 py-1.5 text-sm text-slate-500"
            >
              Not now
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setVisible(false)}
          className="text-slate-400 hover:text-slate-600"
          aria-label="Close install prompt"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
