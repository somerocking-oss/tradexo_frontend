"use client";

import { CompareBar } from "@/components/business/CompareBar";
import { PostRfqStickyTab } from "@/components/layout/PostRfqStickyTab";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";

export function AppChrome() {
  return (
    <>
      <ServiceWorkerRegister />
      <CompareBar />
      <PostRfqStickyTab />
      <InstallPrompt />
    </>
  );
}
