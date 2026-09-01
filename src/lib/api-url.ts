// Server-side code (RSC, route handlers, build-time fetches) can reach the
// backend over an internal/private address that isn't reachable from the
// browser — set INTERNAL_API_URL in production for that. Browser code always
// uses the public NEXT_PUBLIC_API_URL. Falls back to NEXT_PUBLIC_API_URL when
// INTERNAL_API_URL isn't set, so this is a no-op until it's configured.
export const API_URL =
  typeof window === "undefined"
    ? process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5003"
    : process.env.NEXT_PUBLIC_API_URL || "http://localhost:5003";
