"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

const FAQ = [
  {
    q: "How does the liquidity pool work?",
    a: "You deposit ETH into a shared pool and receive shares. Approved borrowers are paid out of the pool, and their repayments flow back in. Interest raises the value of every share, so your shares grow as loans are repaid.",
  },
  {
    q: "Is there a platform fee?",
    a: "No. In this prototype all borrower interest and origination fees stay in the pool for investors. Avelon takes nothing from your deposit or your yield.",
  },
  {
    q: "Is my return guaranteed?",
    a: "No. You earn only when borrowers repay. If a loan defaults, the loss lowers every share, partly offset by the borrower's seized stake, which goes back into the pool.",
  },
  {
    q: "When can I withdraw?",
    a: "Any time, with no lock-up, up to the ETH sitting idle in the pool. ETH lent to borrowers comes back as they repay. The Withdraw page shows what you can take out right now.",
  },
  {
    q: "Do I have to claim my yield?",
    a: "No. Unclaimed yield keeps compounding inside your shares. Claiming takes only the gain and leaves your deposit invested.",
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
          <li>Link your wallet with a free signature, then open <strong className="text-stone-800">Invest / Deposit</strong> and enter an amount between 0.01 and 10 ETH.</li>
          <li>Confirm the deposit in your wallet. Your shares appear once the pool records it.</li>
          <li>Track activity under <strong className="text-stone-800">Transactions</strong> and returns under <strong className="text-stone-800">Earnings</strong>.</li>
        </ol>
      </section>
    </div>
  );
}
