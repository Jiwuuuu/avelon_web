"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

const FAQ = [
  {
    q: "How does the liquidity pool work?",
    a: "You deposit supported assets into a shared pool. Borrowers draw from that pool under smart-contract rules; interest flows back to LPs after the platform fee.",
  },
  {
    q: "What is the 10% platform fee?",
    a: "Avelon retains 10% of interest revenue to operate the protocol. It is not taken from your principal deposit.",
  },
  {
    q: "When can I withdraw?",
    a: "You can initiate withdrawals subject to pool liquidity and any lock rules enforced by the contract. The Withdraw page shows your withdrawable balance.",
  },
  {
    q: "Where do I see my transactions?",
    a: "Open Investment Transactions for deposits, withdrawals, and earnings, including transaction hashes and status filters.",
  },
];

export default function HelpPage() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="max-w-2xl space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Help and support</h1>
        <p className="text-stone-500 text-sm mt-1">FAQ and a short guide to investing on Avelon.</p>
      </div>

      <section>
        <h2 className="text-sm font-semibold text-stone-800 uppercase tracking-wide mb-3">FAQ</h2>
        <div className="space-y-2">
          {FAQ.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={i} className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold text-stone-900"
                >
                  {item.q}
                  <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>
                {isOpen && <p className="px-5 pb-4 text-sm text-stone-600 leading-relaxed">{item.a}</p>}
              </div>
            );
          })}
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-stone-800 uppercase tracking-wide mb-4">How to invest</h2>
        <ol className="list-decimal list-inside space-y-3 text-sm text-stone-600 leading-relaxed">
          <li>Create an account or sign in, then connect a compatible wallet.</li>
          <li>Open <strong className="text-stone-800">Invest / Deposit</strong>, choose a token, and enter an amount.</li>
          <li>Review estimated pool share, expected yield (after fees), and confirm in your wallet.</li>
          <li>Track activity under <strong className="text-stone-800">Transactions</strong> and returns under <strong className="text-stone-800">Earnings</strong>.</li>
        </ol>
      </section>
    </div>
  );
}
