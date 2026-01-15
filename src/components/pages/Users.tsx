import { useState } from "react";
import { Search, Eye } from "lucide-react";
import adminProfile from "../../assets/will.png";

interface User {
  id: string;
  name: string;
  email: string;
  role: "BORROWER" | "LENDER";
  riskScore?: number;
  status: "ACTIVE" | "INACTIVE";
}

const mockUsers: User[] = [
  { id: "1", name: "Will Anthony Barillo", email: "WillPop@gmail.com", role: "BORROWER", riskScore: 92.5, status: "ACTIVE" },
  { id: "2", name: "Cecilia Francisco", email: "FranciscoCecilia@gmail.com", role: "LENDER", status: "ACTIVE" },
  { id: "3", name: "Aaron Smith", email: "AaronSmith@gmail.com", role: "BORROWER", riskScore: 75.2, status: "INACTIVE" },
];

export default function Users() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | "BORROWER" | "LENDER">("ALL");

  const filteredUsers = mockUsers
    .filter((user) =>
      (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       user.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (roleFilter === "ALL" || user.role === roleFilter)
    );

  return (
    <div className="bg-gray-50 min-h-full">
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
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Users</h1>

        {/* Search + Role Filter */}
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:gap-2 gap-2">
          <div className="flex items-center gap-2">
            {/* Search Bar */}
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded border border-gray-300 w-72">
              <Search size={18} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search users"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white border-0 text-sm outline-none w-full"
              />
            </div>

            {/* Role Dropdown */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as "ALL" | "BORROWER" | "LENDER")}
              className="bg-white text-sm px-3 py-2 rounded border border-gray-300 outline-none"
            >
              <option value="ALL">All Roles</option>
              <option value="BORROWER">BORROWER</option>
              <option value="LENDER">LENDER</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">User</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">Email</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">Role</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">Risk Score</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-medium">
                      {user.name.charAt(0)}
                    </div>
                    <span className="text-sm font-medium text-gray-900">{user.name}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        user.role === "BORROWER" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.riskScore ?? "—"}</td>
                  <td className="px-6 py-4">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">{user.status}</span>
                  </td>
                  <td className="px-6 py-4">
                    <a href="#" className="flex items-center gap-1 text-orange-500 text-sm font-medium hover:text-orange-600 transition">
                      View Details <Eye size={16} />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-sm">No users found</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
