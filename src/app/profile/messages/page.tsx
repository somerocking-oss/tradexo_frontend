"use client";

import { MessageCircle } from "lucide-react";
import { MessagesPanel } from "@/components/chat/MessagesPanel";

export default function ProfileMessagesPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        {/* Page header */}
        <div className="mb-6">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50">
              <MessageCircle className="h-5 w-5 text-violet-600" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">My Messages</h1>
          </div>
          <p className="mt-2 text-sm text-neutral-500">
            Continue conversations with businesses.
          </p>
        </div>

        {/* Messages panel */}
        <div className="rounded-xl border border-neutral-100 bg-white shadow-sm">
          <MessagesPanel basePath="/profile/messages" />
        </div>
      </div>
    </div>
  );
}
