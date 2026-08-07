import { formatPhone } from "@/lib/utils";
import type { User } from "@/types";

/** Label for navbar / header — name first, then username, then mobile. */
export function getUserDisplayName(
  user?: (Pick<User, "name" | "username"> & { mobile?: string }) | null
): string {
  const name = user?.name?.trim();
  if (name) return name;

  const username = user?.username?.trim();
  if (username) return username;

  if (user?.mobile) {
    return formatPhone(user.mobile) || user.mobile;
  }

  return "Account";
}
