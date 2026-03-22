"use client";

import { Bell, Megaphone, TrendingUp, Wallet } from "lucide-react";

const ITEMS = [
  { id: "1", type: "deposit", title: "Deposit confirmed", body: "Your 5,000 USDC deposit is confirmed on-chain.", time: "2h ago" },
  { id: "2", type: "withdraw", title: "Withdrawal submitted", body: "1,200 USDC withdrawal is pending confirmation.", time: "5h ago" },
  { id: "3", type: "pool", title: "Pool performance update", body: "Utilization increased to 72.4%. Borrower demand remains strong.", time: "1d ago" },
  { id: "4", type: "loan", title: "Loan repayment", body: "Borrower pool repayment received; yield accrual updated.", time: "2d ago" },
  { id: "5", type: "system", title: "System announcement", body: "Scheduled maintenance: Mar 28, 02:00–04:00 UTC.", time: "3d ago" },
];

const iconMap = {
  deposit: Wallet,
  withdraw: Wallet,
  pool: TrendingUp,
  loan: TrendingUp,
  system: Megaphone,
} as const;

export default function NotificationsPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Notifications</h1>
        <p className="text-stone-500 text-sm mt-1">Deposit and withdrawal confirmations, pool updates, repayments, and announcements.</p>
      </div>

      <ul className="space-y-3">
        {ITEMS.map((n) => {
          const Icon = iconMap[n.type as keyof typeof iconMap] ?? Bell;
          return (
            <li key={n.id} className="bg-white rounded-2xl border border-stone-200 p-4 shadow-sm flex gap-4">
              <div className="h-10 w-10 rounded-xl bg-[#FFF5F0] flex items-center justify-center shrink-0">
                <Icon className="h-5 w-5 text-[#E85C1A]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex justify-between gap-2 items-start">
                  <p className="font-semibold text-stone-900 text-sm">{n.title}</p>
                  <span className="text-[10px] text-stone-400 shrink-0">{n.time}</span>
                </div>
                <p className="text-sm text-stone-600 mt-1">{n.body}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
