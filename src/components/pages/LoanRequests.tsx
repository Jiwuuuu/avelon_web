import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import adminProfile from "../assets/will.png";

type LoanPlan = "MICRO" | "STARTER" | "PROFESSIONAL" | "ENTERPRISE";

type LoanRequest = {
  id: string;
  name: string;
  handle?: string;
  avatarColor?: string;
  amount: number;
  plan: LoanPlan;
  aiScore: number;
  collateral: string;
  date: string;
  role: "BORROWER" | "LENDER";
};

const sampleData: LoanRequest[] = [
  { id: "1", name: "Will Anthony Barillo", handle: "@wab", avatarColor: "bg-blue-500", amount: 45000, plan: "PROFESSIONAL", aiScore: 92.5, collateral: "25 ETH", date: "2h ago", role: "BORROWER" },
  { id: "2", name: "Cecilia Francisco", handle: "@cec", avatarColor: "bg-purple-500", amount: 15000, plan: "STARTER", aiScore: 88.3, collateral: "8.5 ETH", date: "5h ago", role: "LENDER" },
  { id: "3", name: "Ahron Paul Villacote", handle: "@apv", avatarColor: "bg-green-400", amount: 3500, plan: "MICRO", aiScore: 79.2, collateral: "2.1 ETH", date: "1d ago", role: "BORROWER" },
  { id: "4", name: "Justin Bieber Caronongan", handle: "@jbc", avatarColor: "bg-sky-500", amount: 75500, plan: "PROFESSIONAL", aiScore: 91.7, collateral: "38 ETH", date: "2d ago", role: "LENDER" },
  { id: "5", name: "Justin Cuagdan", handle: "@jc", avatarColor: "bg-indigo-500", amount: 150500, plan: "ENTERPRISE", aiScore: 94.2, collateral: "72 ETH", date: "2d ago", role: "LENDER" },
];

function PlanBadge({ plan }: { plan: LoanPlan }) {
  const classes: Record<LoanPlan, string> = {
    MICRO: "bg-green-100 text-green-700",
    STARTER: "bg-sky-100 text-sky-700",
    PROFESSIONAL: "bg-indigo-100 text-indigo-700",
    ENTERPRISE: "bg-orange-100 text-orange-700",
  };
  return <span className={`px-3 py-1 rounded-full text-xs font-semibold ${classes[plan]}`}>{plan}</span>;
}

export default function LoanRequests() {
  const [searchTerm, setSearchTerm] = useState("");
  const [planFilter, setPlanFilter] = useState<LoanPlan | "ALL">("ALL");

  const filtered = useMemo(() => {
    return sampleData.filter(
      r =>
        (r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
         (r.handle ?? "").toLowerCase().includes(searchTerm.toLowerCase())) &&
        (planFilter === "ALL" || r.plan === planFilter)
    );
  }, [searchTerm, planFilter]);

  const formatMoney = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Top Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-4 flex justify-end items-center">
        <div className="flex items-center gap-3">
          <img
            src={adminProfile}
            alt="Admin"
            className="w-10 h-10 rounded-full object-cover"
          />
          <span className="text-sm font-medium">Admin</span>
        </div>
      </div>

      <div className="p-8">
        {/* Page Title */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Loan Requests</h1>
        </div>

        {/* Search + Plan Filter */}
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:gap-4 gap-2">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded border border-gray-300 w-72">
              <Search size={18} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search applicants"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white border-0 text-sm outline-none w-full"
              />
            </div>

            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value as LoanPlan | "ALL")}
              className="bg-white text-sm px-3 py-2 rounded border border-gray-300 outline-none"
            >
              <option value="ALL">All Plans</option>
              <option value="MICRO">Micro</option>
              <option value="STARTER">Starter</option>
              <option value="PROFESSIONAL">Professional</option>
              <option value="ENTERPRISE">Enterprise</option>
            </select>
          </div>
        </div>

        {/* Loan Table */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 overflow-x-auto">
          <table className="w-full min-w-max">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">Applicant</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">Amount</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">Plan</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">AI Score</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">Collateral</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">Role</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((loan) => (
                <tr key={loan.id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${loan.avatarColor ?? "bg-gray-300"}`}>
                      {loan.name.charAt(0)}
                    </div>
                    <span className="text-sm font-medium text-gray-900">{loan.name}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{formatMoney(loan.amount)}</td>
                  <td className="px-6 py-4"><PlanBadge plan={loan.plan} /></td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{loan.aiScore}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{loan.collateral}</td>
                  <td className="px-6 py-4 text-sm font-medium">{loan.role}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="px-3 py-1 bg-green-500 text-white rounded text-sm">Approve</button>
                      <button className="px-3 py-1 border rounded text-sm">Reject</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-500 text-sm">No loan requests found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
