import { apiGet, apiPost } from "@/lib/api/client";
import type { AuthPayload, User } from "@/types";

export async function sendOtp(mobile: string, channel?: "sms" | "whatsapp") {
  return apiPost<{ message: string; channel?: string; channels?: string[] }>(
    "/auth/send-otp",
    { mobile, ...(channel ? { channel } : {}) }
  );
}

export async function getOtpSettings() {
  return apiGet<{
    settings?: {
      otp?: {
        defaultChannel: "sms" | "whatsapp";
        channels: Array<"sms" | "whatsapp">;
        allowUserChoice: boolean;
      };
    };
  }>("/settings");
}

export async function verifyOtp(mobile: string, otp: string, role?: string, referralCode?: string) {
  return apiPost<AuthPayload>("/auth/verify-otp", {
    mobile,
    otp,
    role,
    ...(referralCode ? { referralCode } : {}),
  });
}

export async function getMe() {
  return apiGet<User>("/auth/me");
}

export async function logout() {
  return apiPost("/auth/logout");
}
