import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import adminProfile from "../../assets/will.png";

type PaymentStatus = "ACTIVE" | "COMPLETED" | "DEFAULTED";

type Payment = {
  id: string;
  borrowerName: string;
  borrowerEmail: string;
  avatarColor: string;
  amount: number;
  plan: "MICRO" | "STARTER" | "PROFESSIONAL" | "ENTERPRISE";
  term: string;
  termNote: string;
  status: PaymentStatus;
  date: string;
};

const payments: Payment[] = [
  {
    id: "#LOAN-4546",
    borrowerName: "Will Anthony Bartilo",
    borrowerEmail: "will@ghostmail.com",
    avatarColor: "bg-green-500",
    amount: 45000,
    plan: "PROFESSIONAL",
    term: "24 months",
    termNote: "18 remaining",
    status: "ACTIVE",
    date: "Jan 5, 2024",
  },
  {
    id: "#LOAN-8080",
    borrowerName: "Cecilia Francisco",
    borrowerEmail: "francisco@lettermail.com",
    avatarColor: "bg-blue-500",
    amount: 15000,
    plan: "STARTER",
    term: "18 months",
    termNote: "Completed",
    status: "COMPLETED",
    date: "Jun 4, 2025",
  },
  {
    id: "#LOAN-8950",
    borrowerName: "Arron Paul Villacorte",
    borrowerEmail: "arron@brightmail.com",
    avatarColor: "bg-emerald-500",
    amount: 3500,
    plan: "MICRO",
    term: "12 months",
    termNote: "4 remaining",
    status: "ACTIVE",
    date: "Jul 6, 2025",
  },
  {
    id: "#LOAN-8970",
    borrowerName: "Justin Bieber Caramongan",
    borrowerEmail: "bieber@lendingboard.com",
    avatarColor: "bg-sky-500",
    amount: 75500,
    plan: "PROFESSIONAL",
    term: "18 months",
    termNote: "Delinquent",
    status: "DEFAULTED",
    date: "Sept 5, 2025",
  },
  {
    id: "#LOAN-8880",
    borrowerName: "Justin Caugdan",
    borrowerEmail: "justin@stablecapital.com",
    avatarColor: "bg-cyan-500",
    amount: 150500,
    plan: "ENTERPRISE",
    term: "36 months",
    termNote: "29 remaining",
    status: "COMPLETED",
    date: "Dec 14, 2025",
  },
];

function StatusBadge({ status }: { status: PaymentStatus }) {
  const classes: Record<PaymentStatus, string> = {
    ACTIVE: "bg-green-100 text-green-700",
    COMPLETED: "bg-blue-100 text-blue-700",
    DEFAULTED: "bg-red-100 text-red-700",
  };
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-semibold ${classes[status]}`}
    >
      {status}
    </span>
  );
}

function PlanBadge({
  plan,
}: {
  plan: Payment["plan"];
}) {
  const classes: Record<Payment["plan"], string> = {
    MICRO: "bg-green-100 text-green-700",
    STARTER: "bg-sky-100 text-sky-700",
    PROFESSIONAL: "bg-indigo-100 text-indigo-700",
    ENTERPRISE: "bg-orange-100 text-orange-700",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${classes[plan]}`}
    >
      {plan}
    </span>
  );
}

const formatMoney = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);

export default function PaymentHistory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | "ALL">(
    "ALL"
  );

  const filtered = useMemo(
    () =>
      payments.filter(
        (p) =>
          (p.borrowerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.borrowerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.id.toLowerCase().includes(searchTerm.toLowerCase())) &&
          (statusFilter === "ALL" || p.status === statusFilter)
      ),
    [searchTerm, statusFilter]
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
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
          <h1 className="text-3xl font-bold text-gray-900">Loan History</h1>
        </div>

        {/* Search + Status Filter */}
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:gap-4 gap-2">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded border border-gray-300 w-72">
              <Search size={18} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search loans or borrowers"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white border-0 text-sm outline-none w-full"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as PaymentStatus | "ALL")
              }
              className="bg-white text-sm px-3 py-2 rounded border border-gray-300 outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
              <option value="DEFAULTED">Defaulted</option>
            </select>
          </div>
        </div>

        {/* Loan History Table */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 overflow-x-auto">
          <table className="w-full min-w-max">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Loan ID
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Borrower
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Amount
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Plan
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Term
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Date
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((payment) => (
                <tr
                  key={payment.id}
                  className="border-b border-gray-200 hover:bg-gray-50 transition"
                >
                  <td className="px-4 py-4 text-xs font-medium text-gray-700">
                    {payment.id}
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full ${payment.avatarColor}`}
                      />
                      <div>
                        <div className="text-sm font-semibold text-gray-900">
                          {payment.borrowerName}
                        </div>
                        <div className="text-xs text-gray-400">
                          {payment.borrowerEmail}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4 text-sm font-semibold text-gray-900">
                    {formatMoney(payment.amount)}
                  </td>

                  <td className="px-4 py-4">
                    <PlanBadge plan={payment.plan} />
                  </td>

                  <td className="px-4 py-4">
                    <div className="text-xs font-medium text-gray-900">
                      {payment.term}
                    </div>
                    <div className="text-[11px] text-gray-400">
                      {payment.termNote}
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <StatusBadge status={payment.status} />
                  </td>

                  <td className="px-4 py-4 text-xs text-gray-500">
                    {payment.date}
                  </td>

                  <td className="px-4 py-4">
                    <button className="text-xs font-semibold text-orange-500 hover:text-orange-600">
                      View Details →
                    </button>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="text-center py-12 text-gray-500 text-sm"
                  >
                    No payments found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
