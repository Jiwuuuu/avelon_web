"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  PiggyBank,
  Banknote,
  Waves,
  ListOrdered,
  TrendingUp,
  Bell,
  User,
  HelpCircle,
  LogOut,
  Wallet,
} from "lucide-react";
import {
  clearInvestorSession,
  getInvestorSession,
  type InvestorSession,
} from "@/lib/investor-session";
import { useEffect, useLayoutEffect, useState } from "react";

const nav = [
  { href: "/investor/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/investor/invest", label: "Invest / Deposit", icon: PiggyBank },
  { href: "/investor/withdraw", label: "Withdraw", icon: Banknote },
  { href: "/investor/pool", label: "Pool overview", icon: Waves },
  { href: "/investor/transactions", label: "Transactions", icon: ListOrdered },
  { href: "/investor/earnings", label: "Earnings", icon: TrendingUp },
  { href: "/investor/notifications", label: "Notifications", icon: Bell },
  { href: "/investor/profile", label: "Profile", icon: User },
  { href: "/investor/help", label: "Help", icon: HelpCircle },
];

function shortAddr(a: string) {
  if (a.length < 12) return a;
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}

export function InvestorPortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<InvestorSession | null>(null);
  const [ready, setReady] = useState(false);

  // Read session before paint so we don’t briefly redirect after login (client nav + localStorage).
  useLayoutEffect(() => {
    setSession(getInvestorSession());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (!getInvestorSession()) {
      const next = encodeURIComponent(pathname || "/investor/dashboard");
      router.replace(`/investor/signin?next=${next}`);
    }
  }, [ready, pathname, router]);

  function logout() {
    clearInvestorSession();
    router.push("/investor");
  }

  if (!ready || !session) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <p className="text-stone-500 text-sm">Loading…</p>
      </div>
    );
  }

  const wallet = session.walletAddress ?? "Not connected";

  return (
    <div className="min-h-screen bg-stone-50 flex font-sans text-stone-900">
      <aside className="w-60 shrink-0 border-r border-stone-200 bg-white flex flex-col">
        <div className="p-5 border-b border-stone-100">
          <Link href="/investor/dashboard" className="flex items-center gap-2 font-bold text-lg tracking-tight">
            <span className="inline-flex h-8 w-8 rounded-lg bg-[#E85C1A]/15 items-center justify-center text-[#E85C1A] text-xs">
              A
            </span>
            Avelon
          </Link>
          <p className="text-xs text-stone-500 mt-1">Investor portal</p>
        </div>
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {nav.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname?.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  active
                    ? "bg-[#FFF5F0] text-[#E85C1A]"
                    : "text-stone-600 hover:bg-stone-50"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-stone-100">
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-stone-600 hover:bg-red-50 hover:text-red-700 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 shrink-0 border-b border-stone-200 bg-white px-6 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs text-stone-500 truncate">{session.email}</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-stone-600 bg-stone-100 rounded-full pl-3 pr-2 py-1.5 max-w-[min(100%,280px)]">
            <Wallet className="h-3.5 w-3.5 text-[#E85C1A] shrink-0" />
            <span className="truncate font-mono">{wallet.startsWith("0x") ? shortAddr(wallet) : wallet}</span>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
