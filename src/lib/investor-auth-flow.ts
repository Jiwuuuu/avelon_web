import { getInvestorSession, setInvestorSession } from "@/lib/investor-session";

const DEMO_WALLET = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e";

/** Demo investor account (local only — replace with real auth in production). */
export const DEMO_INVESTOR_EMAIL = "test@gmail.com";
export const DEMO_INVESTOR_PASSWORD = "12345678";

function normalizePassword(p: string): string {
  return p.trim().replace(/[\u200B-\u200D\uFEFF]/g, "");
}

export function completeEmailAuth(input: {
  email: string;
  password: string;
  fullName?: string;
  mode: "login" | "signup";
}): { ok: true } | { ok: false; message: string } {
  const email = input.email.trim().toLowerCase();
  const password = normalizePassword(input.password);
  if (!email || !password) {
    return { ok: false, message: "Please enter your email and password." };
  }
  if (input.mode === "signup" && !(input.fullName?.trim())) {
    return { ok: false, message: "Please enter your full name." };
  }

  const emailOk = email === DEMO_INVESTOR_EMAIL.toLowerCase();
  const passwordOk = password === DEMO_INVESTOR_PASSWORD;
  if (!emailOk || !passwordOk) {
    return {
      ok: false,
      message: `Invalid email or password. Demo login: ${DEMO_INVESTOR_EMAIL} / ${DEMO_INVESTOR_PASSWORD}`,
    };
  }

  try {
    setInvestorSession({
      email: DEMO_INVESTOR_EMAIL,
      name: input.fullName?.trim() || "Demo Investor",
    });
  } catch {
    return {
      ok: false,
      message: "Could not save your session. Check that browser storage is enabled.",
    };
  }
  return { ok: true };
}

export function completeWalletAuth(): void {
  const cur = getInvestorSession();
  setInvestorSession({
    email: cur?.email?.trim() || "wallet@connected.local",
    name: cur?.name,
    walletAddress: DEMO_WALLET,
  });
}

/** Full navigation so the portal layout reads localStorage on a fresh load. */
export function goToInvestorPortal(redirectTo: string): void {
  if (typeof window === "undefined") return;
  const path =
    redirectTo.startsWith("/") && !redirectTo.startsWith("//") ? redirectTo : "/investor/dashboard";
  window.location.assign(path);
}
