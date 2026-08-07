"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  extractConversationList,
  extractMessageList,
  getChatMessages,
  getConversations,
  sendChatMessage,
  type ChatConversation,
  type ChatMessage,
} from "@/lib/api/chat";
import { blockChatUser, reportConversation } from "@/lib/api/referral";

export function MessagesPanel({ basePath = "/dashboard/messages" }: { basePath?: string }) {
  const { user } = useAuth();
  const socket = useSocket();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeId, setActiveId] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadConversations = useCallback(async () => {
    const res = await getConversations();
    if (res.success && res.data) {
      const list = extractConversationList(res.data);
      setConversations(list);
      if (!activeId && list.length) setActiveId(list[0]._id);
    }
    setLoading(false);
  }, [activeId]);

  const loadMessages = useCallback(async (conversationId: string) => {
    if (!conversationId) return;
    const res = await getChatMessages(conversationId);
    if (res.success && res.data) setMessages(extractMessageList(res.data));
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (activeId) loadMessages(activeId);
  }, [activeId, loadMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!socket || !activeId) return;
    socket.emit("join-conversation", activeId);

    const onMessage = (payload: { conversationId?: string; message?: ChatMessage }) => {
      if (payload.conversationId !== activeId || !payload.message) return;
      setMessages((prev) => [...prev, payload.message!]);
      loadConversations();
    };

    socket.on("chat-message", onMessage);
    return () => {
      socket.off("chat-message", onMessage);
    };
  }, [socket, activeId, loadConversations]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeId || !draft.trim()) return;
    setSending(true);
    setSendError("");
    try {
      const res = await sendChatMessage(activeId, draft.trim());
      if (res.success && res.data) {
        setMessages((prev) => [...prev, res.data!]);
        setDraft("");
        loadConversations();
      } else {
        setSendError(res.message || "Message could not be sent");
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setSendError(msg || "Message could not be sent");
    } finally {
      setSending(false);
    }
  };

  const activeConversation = conversations.find((c) => c._id === activeId);
  const isSellerView = basePath.startsWith("/dashboard");
  const otherUserId = activeConversation
    ? isSellerView
      ? activeConversation.buyerId?._id
      : activeConversation.sellerId?._id
    : undefined;

  const handleReport = async () => {
    if (!activeId) return;
    const reason = window.prompt("Why are you reporting this chat?");
    if (!reason?.trim()) return;
    await reportConversation(activeId, reason.trim());
    window.alert("Report submitted");
  };

  const handleBlock = async () => {
    if (!otherUserId) return;
    if (!window.confirm("Block this user? You will not be able to chat.")) return;
    await blockChatUser(String(otherUserId), "Blocked from chat");
    setActiveId("");
  };

  if (loading) return <div className="py-20 text-center text-slate-500">Loading messages...</div>;

  return (
    <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
      <Card className="h-[min(70vh,640px)] overflow-hidden">
        <CardBody className="flex h-full flex-col p-0">
          <div className="border-b border-slate-100 px-4 py-3 font-semibold">Conversations</div>
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <p className="px-4 py-8 text-sm text-slate-500">No chats yet.</p>
            ) : (
              conversations.map((conv) => {
                const title = isSellerView
                  ? conv.buyerId?.name || conv.buyerId?.mobile || "Buyer"
                  : conv.businessId?.name || "Business";
                const unread = isSellerView ? conv.sellerUnread : conv.buyerUnread;
                return (
                  <button
                    key={conv._id}
                    type="button"
                    onClick={() => setActiveId(conv._id)}
                    className={`w-full border-b border-slate-50 px-4 py-3 text-left transition hover:bg-slate-50 ${
                      activeId === conv._id ? "bg-[#e8e8e8]" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-medium text-slate-900">{title}</p>
                      {!!unread && (
                        <span className="rounded-full bg-[#ff6c00] px-1.5 text-[10px] font-bold text-white">
                          {unread}
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 truncate text-xs text-slate-500">{conv.lastMessage}</p>
                  </button>
                );
              })
            )}
          </div>
        </CardBody>
      </Card>

      <Card className="h-[min(70vh,640px)] overflow-hidden">
        <CardBody className="flex h-full flex-col p-0">
          <div className="border-b border-slate-100 px-4 py-3">
            <div className="flex items-center justify-between gap-2">
              <p className="font-semibold text-slate-900">
                {activeConversation
                  ? isSellerView
                    ? activeConversation.buyerId?.name || "Buyer chat"
                    : activeConversation.businessId?.name || "Business chat"
                  : "Select a conversation"}
              </p>
              {activeId && otherUserId && (
                <div className="flex gap-1">
                  <Button type="button" size="sm" variant="ghost" onClick={handleReport}>
                    Report
                  </Button>
                  <Button type="button" size="sm" variant="ghost" onClick={handleBlock}>
                    Block User
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((msg) => {
              const mine = String(msg.senderId) === String(user?._id);
              return (
                <div key={msg._id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                      mine ? "bg-[#ff6c00] text-white" : "bg-slate-100 text-slate-800"
                    }`}
                  >
                    {msg.body}
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {activeId && (
            <div className="border-t border-slate-100">
              {sendError && (
                <p className="px-3 pt-2 text-xs font-medium text-red-600">{sendError}</p>
              )}
              <form onSubmit={handleSend} className="flex gap-2 p-3">
                <Input
                  value={draft}
                  onChange={(e) => {
                    setDraft(e.target.value);
                    if (sendError) setSendError("");
                  }}
                  placeholder="Type a message..."
                  disabled={sending}
                />
                <Button type="submit" disabled={sending || !draft.trim()}>
                  Send
                </Button>
              </form>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
