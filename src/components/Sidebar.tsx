import { 
  BarChart3, 
  Users, 
  FileText, 
  GitPullRequest, 
  Clock, 
  History, 
  BarChart, 
  Wallet, 
  CheckCircle, 
  Settings, 
  LogOut, 
  TrendingUp 
} from "lucide-react";

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export default function Sidebar({ currentPage, onNavigate, onLogout }: SidebarProps) {
  const menuItems = [
    { id: "dashboard", icon: BarChart3, label: "Dashboard" },
    { id: "users", icon: Users, label: "Users" },
    { id: "loan-plans", icon: FileText, label: "Loan Plans" },
    { id: "loan-requests", icon: GitPullRequest, label: "Loan Requests" },
    { id: "payment-history", icon: Clock, label: "Payment History" },
    { id: "transaction-history", icon: History, label: "Transaction History" },
    { id: "loan-status", icon: BarChart, label: "Loan Status" },
    { id: "deposits", icon: TrendingUp, label: "Deposits" },
    { id: "wallet", icon: Wallet, label: "Wallet" },
    { id: "completed-loans", icon: CheckCircle, label: "Completed Loans" },
  ];

  return (
    <div className="w-64 bg-white h-screen border-r border-gray-200 flex flex-col">
      {/* Sidebar Header (same height as top bar for alignment) */}
      <div className="h-16 flex items-center justify-center border-b border-gray-200 px-4">
        <div className="h-10 w-32 rounded-md border border-dashed border-gray-300 flex items-center justify-center text-xs text-gray-400">
          Logo placeholder
        </div>
      </div>

      {/* Sidebar Menu */}
      <div className="flex-1 overflow-y-auto py-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-6 py-3 text-left transition ${
                isActive
                  ? "bg-orange-50 text-orange-600 border-r-4 border-orange-500"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Icon size={20} />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Settings & Logout */}
      <div className="border-t border-gray-200 p-4">
        <button
          onClick={() => onNavigate("settings")}
          className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition mb-2"
        >
          <Settings size={20} />
          <span className="text-sm font-medium">Settings</span>
        </button>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition"
        >
          <LogOut size={20} />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}
