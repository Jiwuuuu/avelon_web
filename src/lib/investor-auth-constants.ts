/** Shared with `src/proxy.ts` (Next.js request proxy) and client session helpers. */
export const INVESTOR_AUTH_COOKIE = "avelon_investor_auth";
export const INVESTOR_AUTH_COOKIE_VALUE = "1";

/** Routes that require investor login (server checks cookie; client uses localStorage). */
export const INVESTOR_PORTAL_PATHS = [
  "/investor/dashboard",
  "/investor/invest",
  "/investor/withdraw",
  "/investor/pool",
  "/investor/transactions",
  "/investor/earnings",
  "/investor/notifications",
  "/investor/profile",
  "/investor/help",
] as const;
