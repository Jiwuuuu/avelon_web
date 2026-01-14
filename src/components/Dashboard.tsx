import { TrendingUp, Users, Activity, Clock, Zap } from "lucide-react";
import adminProfile from "../assets/will.png";

export default function Dashboard() {
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 text-gray-500 text-xs mb-2">
              <TrendingUp size={14} />
              <span>TOTAL LOANS</span>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-3xl font-bold text-gray-900">$6.9M</div>
                <div className="text-green-500 text-sm font-medium mt-1">↑12.5%</div>
              </div>
              <div className="text-yellow-500 text-2xl">💰</div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 text-gray-500 text-xs mb-2">
              <Users size={14} />
              <span>ACTIVE USERS</span>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-3xl font-bold text-gray-900">6,6969</div>
                <div className="text-green-500 text-sm font-medium mt-1">↑6.9%</div>
              </div>
              <div className="text-blue-500 text-2xl">👥</div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 text-gray-500 text-xs mb-2">
              <Activity size={14} />
              <span>AI RISK SCORE AVG</span>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-3xl font-bold text-gray-900">8.9</div>
                <div className="text-green-500 text-sm font-medium mt-1">↑8.1%</div>
              </div>
              <div className="text-purple-500 text-2xl">📊</div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 text-gray-500 text-xs mb-2">
              <Clock size={14} />
              <span>PENDING REVIEWS</span>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-3xl font-bold text-gray-900">20</div>
                <div className="text-red-500 text-sm font-medium mt-1">Requires Attention</div>
              </div>
              <div className="text-orange-500 text-2xl">⚠️</div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Loan Volume Trends */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">Loan Volume Trends</h3>
                <p className="text-xs text-gray-400 mt-1">Past 7 days (Millions)</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-xs text-gray-500">Volume</span>
              </div>
            </div>
            <div className="relative h-72">
              <svg className="w-full h-full" viewBox="0 0 500 280" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="gradient1" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#f97316" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
                  </linearGradient>
                </defs>
                
                {/* Grid Lines */}
                <line x1="50" y1="40" x2="50" y2="240" stroke="#e5e7eb" strokeWidth="1" />
                <line x1="50" y1="240" x2="480" y2="240" stroke="#e5e7eb" strokeWidth="1" />
                
                {/* Grid horizontal lines */}
                <line x1="50" y1="80" x2="480" y2="80" stroke="#f3f4f6" strokeWidth="1" strokeDasharray="4" />
                <line x1="50" y1="120" x2="480" y2="120" stroke="#f3f4f6" strokeWidth="1" strokeDasharray="4" />
                <line x1="50" y1="160" x2="480" y2="160" stroke="#f3f4f6" strokeWidth="1" strokeDasharray="4" />
                <line x1="50" y1="200" x2="480" y2="200" stroke="#f3f4f6" strokeWidth="1" strokeDasharray="4" />
                
                {/* Axis Labels Y */}
                <text x="40" y="245" fontSize="11" fill="#9ca3af" textAnchor="end">$0</text>
                <text x="40" y="205" fontSize="11" fill="#9ca3af" textAnchor="end">$2M</text>
                <text x="40" y="165" fontSize="11" fill="#9ca3af" textAnchor="end">$4M</text>
                <text x="40" y="125" fontSize="11" fill="#9ca3af" textAnchor="end">$6M</text>
                <text x="40" y="85" fontSize="11" fill="#9ca3af" textAnchor="end">$8M</text>
                
                {/* Axis Labels X */}
                <text x="70" y="260" fontSize="11" fill="#9ca3af" textAnchor="middle">Mon</text>
                <text x="140" y="260" fontSize="11" fill="#9ca3af" textAnchor="middle">Tue</text>
                <text x="210" y="260" fontSize="11" fill="#9ca3af" textAnchor="middle">Wed</text>
                <text x="280" y="260" fontSize="11" fill="#9ca3af" textAnchor="middle">Thu</text>
                <text x="350" y="260" fontSize="11" fill="#9ca3af" textAnchor="middle">Fri</text>
                <text x="420" y="260" fontSize="11" fill="#9ca3af" textAnchor="middle">Sat</text>
                <text x="460" y="260" fontSize="11" fill="#9ca3af" textAnchor="middle">Sun</text>
                
                {/* Area fill */}
                <polygon
                  points="70,140 140,100 210,70 280,110 350,50 420,35 460,30 480,240 70,240"
                  fill="url(#gradient1)"
                />
                
                {/* Line */}
                <polyline
                  fill="none"
                  stroke="#f97316"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points="70,140 140,100 210,70 280,110 350,50 420,35 460,30"
                />
                
                {/* Data points */}
                <circle cx="70" cy="140" r="5" fill="white" stroke="#f97316" strokeWidth="2" />
                <circle cx="140" cy="100" r="5" fill="white" stroke="#f97316" strokeWidth="2" />
                <circle cx="210" cy="70" r="5" fill="white" stroke="#f97316" strokeWidth="2" />
                <circle cx="280" cy="110" r="5" fill="white" stroke="#f97316" strokeWidth="2" />
                <circle cx="350" cy="50" r="5" fill="white" stroke="#f97316" strokeWidth="2" />
                <circle cx="420" cy="35" r="5" fill="white" stroke="#f97316" strokeWidth="2" />
                <circle cx="460" cy="30" r="5" fill="white" stroke="#f97316" strokeWidth="2" />
              </svg>
            </div>
          </div>

          {/* Ethereum Volatility Prediction */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold mb-6">Ethereum Volatility Prediction</h3>
            
            {/* Forecast Info */}
            <div className="bg-orange-50 rounded-lg p-5 mb-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-xs text-gray-500 font-semibold block">FORECAST</span>
                  <span className="text-2xl font-bold text-gray-900">Next 7 Days</span>
                </div>
                <div className="text-center">
                  <span className="text-xs text-gray-500 font-semibold block mb-2">VOLATILITY</span>
                  <span className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full inline-block">HIGH</span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-500 font-semibold block">CONFIDENCE</span>
                  <span className="text-2xl font-bold text-green-500">87.3%</span>
                </div>
              </div>
            </div>

            {/* Volatility Trend Chart */}
            <div>
              <p className="text-xs text-gray-500 font-medium mb-3">Volatility Trend (Next 7 Days)</p>
              <svg className="w-full h-40" viewBox="0 0 500 120" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="volGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#f97316" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
                  </linearGradient>
                </defs>
                
                {/* Grid lines */}
                <line x1="40" y1="20" x2="40" y2="100" stroke="#e5e7eb" strokeWidth="1" />
                <line x1="40" y1="100" x2="500" y2="100" stroke="#e5e7eb" strokeWidth="1" />
                
                {/* Horizontal grid */}
                <line x1="40" y1="45" x2="500" y2="45" stroke="#f3f4f6" strokeWidth="1" strokeDasharray="3" />
                <line x1="40" y1="72.5" x2="500" y2="72.5" stroke="#f3f4f6" strokeWidth="1" strokeDasharray="3" />
                
                {/* Y axis labels */}
                <text x="35" y="105" fontSize="10" fill="#9ca3af" textAnchor="end">Low</text>
                <text x="35" y="78" fontSize="10" fill="#9ca3af" textAnchor="end">Mid</text>
                <text x="35" y="25" fontSize="10" fill="#9ca3af" textAnchor="end">High</text>
                
                {/* Area fill */}
                <polygon
                  points="50,75 130,70 210,55 290,50 370,48 450,50 480,100 50,100"
                  fill="url(#volGradient)"
                />
                
                {/* Line */}
                <polyline
                  fill="none"
                  stroke="#f97316"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points="50,75 130,70 210,55 290,50 370,48 450,50 480,52"
                />
                
                {/* Data points */}
                <circle cx="50" cy="75" r="4" fill="white" stroke="#f97316" strokeWidth="2" />
                <circle cx="130" cy="70" r="4" fill="white" stroke="#f97316" strokeWidth="2" />
                <circle cx="210" cy="55" r="4" fill="white" stroke="#f97316" strokeWidth="2" />
                <circle cx="290" cy="50" r="4" fill="white" stroke="#f97316" strokeWidth="2" />
                <circle cx="370" cy="48" r="4" fill="white" stroke="#f97316" strokeWidth="2" />
                <circle cx="450" cy="50" r="4" fill="white" stroke="#f97316" strokeWidth="2" />
                <circle cx="480" cy="52" r="4" fill="white" stroke="#f97316" strokeWidth="2" />
              </svg>
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <div className="font-medium text-sm">Loan #69696 Approved</div>
                  <div className="text-xs text-gray-500">5 minutes ago</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <div className="font-medium text-sm">New User Registration</div>
                  <div className="text-xs text-gray-500">15 minutes ago</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <div className="font-medium text-sm">AI Model Updated</div>
                  <div className="text-xs text-gray-500">1 hour ago</div>
                </div>
              </div>
            </div>
          </div>

          {/* System Status & Quick Actions */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">System Status</h3>
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2">
                  <Zap className="text-green-500" size={18} />
                  <span className="text-sm font-medium">Smart Contracts</span>
                </div>
                <span className="text-xs text-green-600 font-medium">LIVE</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2">
                  <Activity className="text-green-500" size={18} />
                  <span className="text-sm font-medium">AI Risk Models</span>
                </div>
                <span className="text-xs text-green-600 font-medium">ACTIVE</span>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-3">Quick Actions</h4>
              <button className="w-full bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium py-2 px-4 rounded-lg mb-2 transition">
                Review Pending Loans (23)
              </button>
              <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-2 px-4 rounded-lg transition">
                Configure AI Models
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}