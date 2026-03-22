import { INVESTOR_AUTH_COOKIE, INVESTOR_AUTH_COOKIE_VALUE } from "@/lib/investor-auth-constants";

export type InvestorSession = {
  email: string;
  name?: string;
  walletAddress?: string;
};

const STORAGE_KEY = "avelon_investor_session";
const COOKIE_MAX_AGE_SEC = 60 * 60 * 24 * 7; // 7 days

export { INVESTOR_AUTH_COOKIE, INVESTOR_AUTH_COOKIE_VALUE };

function setAuthCookie(present: boolean): void {
  if (typeof document === "undefined") return;
  if (present) {
    document.cookie = `${INVESTOR_AUTH_COOKIE}=${INVESTOR_AUTH_COOKIE_VALUE}; Path=/; Max-Age=${COOKIE_MAX_AGE_SEC}; SameSite=Lax`;
  } else {
    document.cookie = `${INVESTOR_AUTH_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
  }
}

/** Keep optional cookie aligned with localStorage (optional; portal auth uses storage). */
export function syncInvestorAuthCookieWithStorage(): void {
  if (typeof window === "undefined") return;
  setAuthCookie(!!getInvestorSession());
}

export function getInvestorSession(): InvestorSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as InvestorSession;
  } catch {
    return null;
  }
}

export function setInvestorSession(session: InvestorSession): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  setAuthCookie(true);
}

export function clearInvestorSession(): void {
  localStorage.removeItem(STORAGE_KEY);
  setAuthCookie(false);
}

export function setInvestorWallet(address: string): void {
  const s = getInvestorSession();
  if (s) setInvestorSession({ ...s, walletAddress: address });
}
