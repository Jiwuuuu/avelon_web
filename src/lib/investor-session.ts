export type InvestorSession = {
  email: string;
  name?: string;
  walletAddress?: string;
};

const STORAGE_KEY = "avelon_investor_session";

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
}

export function clearInvestorSession(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function setInvestorWallet(address: string): void {
  const s = getInvestorSession();
  if (s) setInvestorSession({ ...s, walletAddress: address });
}
