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

const AUTH_STORAGE_KEY = "avelon:isAuthenticated"
const PAGE_STORAGE_KEY = "avelon:currentPage"

export default function AppController() {
  const [authState, setAuthState] = useState<AuthState>(() => {
    if (typeof window === "undefined") {
      return { isAuthenticated: false }
    }
    return { isAuthenticated: window.localStorage.getItem(AUTH_STORAGE_KEY) === "true" }
  })
  const [currentPage, setCurrentPage] = useState<PageId>(() => {
    if (typeof window === "undefined") {
      return "dashboard"
    }
    return (window.localStorage.getItem(PAGE_STORAGE_KEY) as PageId | null) ?? "dashboard"
  })

  const handleLogin = () => {
    setAuthState({ isAuthenticated: true })
    window.localStorage.setItem(AUTH_STORAGE_KEY, "true")
  }

  const handleLogout = () => {
    setAuthState({ isAuthenticated: false })
    setCurrentPage("dashboard")
    window.localStorage.removeItem(AUTH_STORAGE_KEY)
    window.localStorage.removeItem(PAGE_STORAGE_KEY)
  }

  const handleNavigate = (page: string) => {
    if (page as PageId) {
      const typedPage = page as PageId
      setCurrentPage(typedPage)
      window.localStorage.setItem(PAGE_STORAGE_KEY, typedPage)
    } else {
      setCurrentPage("dashboard")
      window.localStorage.setItem(PAGE_STORAGE_KEY, "dashboard")
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
      <Sidebar currentPage={currentPage} onNavigate={handleNavigate} onLogout={handleLogout} />

      <div className="flex-1 overflow-auto">{renderPage()}</div>
    </div>
  )
}

