"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { startConversation } from "@/lib/api/chat";

export function BusinessChatButton({
  businessId,
  businessName,
  ownerId,
}: {
  businessId: string;
  businessName: string;
  ownerId?: string;
}) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Owner apne business ke saath chat nahi kar sakta
  if (ownerId && user && String(ownerId) === String(user._id)) return null;

  const handleChat = async () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/business/${businessId}`);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await startConversation(businessId);
      if (res.success) {
        router.push("/profile/messages");
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || "Could not start conversation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <Button variant="outline" onClick={handleChat} disabled={loading}>
        <MessageCircle className="h-4 w-4" />
        {loading ? "Opening..." : `Chat with ${businessName.split(" ")[0]}`}
      </Button>
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}
