'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Menu } from 'lucide-react'
import Sidebar from '@/components/layout/Sidebar'
import { useAuth } from '@/contexts/auth-context'
import { UserRole } from '@/types'

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const router = useRouter()
    const pathname = usePathname()
    const { user, isLoading, isAuthenticated, logout } = useAuth()
    const [sidebarOpen, setSidebarOpen] = useState(false)

    useEffect(() => {
        if (!isLoading && (!isAuthenticated || user?.role !== UserRole.ADMIN)) {
            router.replace('/login')
        }
    }, [isLoading, isAuthenticated, user?.role, router])

    // Close sidebar on route change (mobile)
    useEffect(() => {
        setSidebarOpen(false)
    }, [pathname])

    const handleLogout = async () => {
        document.cookie = 'avelon:authenticated=; path=/; max-age=0'
        await logout()
    }

    const getCurrentPage = () => {
        if (pathname === '/admin') return 'dashboard'
        const segments = pathname.split('/')
        return segments[segments.length - 1] || 'dashboard'
    }

    const handleNavigate = (page: string) => {
        if (page === 'dashboard') {
            router.push('/admin')
        } else {
            router.push(`/admin/${page}`)
        }
    }

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-100">
                <div className="text-gray-500">Loading...</div>
            </div>
        )
    }

    if (!isAuthenticated || user?.role !== UserRole.ADMIN) {
        return null
    }

    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar
                currentPage={getCurrentPage()}
                onNavigate={handleNavigate}
                onLogout={handleLogout}
                userName={user?.name || user?.email || 'Admin'}
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Mobile header with hamburger */}
                <div className="md:hidden flex items-center h-14 px-4 bg-white border-b border-gray-200 shrink-0">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition"
                        aria-label="Open menu"
                    >
                        <Menu size={22} />
                    </button>
                    <span className="ml-3 text-sm font-semibold text-gray-900">Avelon Admin</span>
                </div>
                <main className="flex-1 overflow-auto" role="main" aria-label="Page content">
                    {children}
                </main>
            </div>
        </div>
    )
}
