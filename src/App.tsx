import { useState } from "react"
import Login from "./components/Login"
import Dashboard from "./components/Dashboard"
import Users from "./components/Users"
import LoanRequests from "./components/LoanRequests"
import Sidebar from "./components/Sidebar"
import LoanPlans from "./components/Loan Plans"
import PaymentHistory from "./components/Paymenthistory"
import Transaction from "./components/Transaction"
import LoanStatus from "./components/LoanStatus"
import Deposits from "./components/Deposits"
import Wallet from "./components/Wallet"
import CompletedLoans from "./components/CompletedLoans"
import Settings from "./components/Settings"

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [currentPage, setCurrentPage] = useState<string>("dashboard")

  const handleLogin = () => setIsAuthenticated(true)
  const handleLogout = () => {
    setIsAuthenticated(false)
    setCurrentPage("dashboard")
  }
  const handleNavigate = (page: string) => setCurrentPage(page)

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />
  }

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard />
      case "users":
        return <Users />
      case "loan-plans":
        return <LoanPlans />
      case "loan-requests":
        return <LoanRequests />
      case "payment-history":
        return <PaymentHistory />
      case "transaction-history":
        return <Transaction />
      case "loan-status":
        return <LoanStatus />
      case "deposits":
        return <Deposits />
      case "wallet":
        return <Wallet />
      case "completed-loans":
        return <CompletedLoans />
      case "settings":
        return <Settings />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {renderPage()}
      </div>
    </div>
  )
}

export default App
