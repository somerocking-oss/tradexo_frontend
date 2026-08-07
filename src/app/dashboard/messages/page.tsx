"use client";

import { MessagesPanel } from "@/components/chat/MessagesPanel";

export default function DashboardMessagesPage() {
  return (
    <div className="space-y-6 px-4 lg:px-0">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Messages</h1>
        <p className="mt-1 text-sm text-slate-600">Chat with buyers in real time.</p>
      </div>
      <MessagesPanel basePath="/dashboard/messages" />
    </div>
  );
}
