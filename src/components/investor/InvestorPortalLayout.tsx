"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

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

export function InvestorPortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isLoading, isAuthenticated, logout } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <p className="text-stone-500 text-sm">Loading…</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    // The proxy.ts middleware should have already redirected,
    // but as a safety net render nothing while the redirect resolves.
    return null;
  }

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
            onClick={() => logout()}
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
            <p className="text-xs text-stone-500 truncate">{user.email}</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-stone-600 bg-stone-100 rounded-full pl-3 pr-2 py-1.5">
            <User className="h-3.5 w-3.5 text-[#E85C1A] shrink-0" />
            <span className="truncate">{user.name || 'Investor'}</span>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
