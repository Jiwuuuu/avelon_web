import { useState } from "react"
import type { PageId, AuthState } from "../models/appModels"

import Login from "../components/pages/Login"
import Sidebar from "../components/Sidebar"

// Views (page-level components)
import Dashboard from "../components/pages/Dashboard"
import Users from "../components/pages/Users"
import LoanRequests from "../components/pages/LoanRequests"
import LoanPlans from "../components/pages/Loan Plans"
import PaymentHistory from "../components/pages/Paymenthistory"
import Transaction from "../components/pages/Transaction"
import LoanStatus from "../components/pages/LoanStatus"
import Deposits from "../components/pages/Deposits"
import Wallet from "../components/pages/Wallet"
import CompletedLoans from "../components/pages/CompletedLoans"
import Settings from "../components/pages/Settings"

// Controller component (C in MVC) - coordinates auth, navigation, and which view to show.
export default function AppController() {
  const [authState, setAuthState] = useState<AuthState>({ isAuthenticated: false })
  const [currentPage, setCurrentPage] = useState<PageId>("dashboard")

  const handleLogin = () => setAuthState({ isAuthenticated: true })

  const handleLogout = () => {
    setAuthState({ isAuthenticated: false })
    setCurrentPage("dashboard")
  }

  const handleNavigate = (page: string) => {
    // Narrow incoming string to known PageId; fallback to dashboard
    if (page as PageId) {
      setCurrentPage(page as PageId)
    } else {
      setCurrentPage("dashboard")
    }
  }

  if (!authState.isAuthenticated) {
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
      {/* Sidebar (part of the View layer) */}
      <Sidebar currentPage={currentPage} onNavigate={handleNavigate} onLogout={handleLogout} />

      {/* Main Content (View container) */}
      <div className="flex-1 overflow-auto">{renderPage()}</div>
    </div>
  )
}

