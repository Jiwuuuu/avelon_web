'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'
import { useAuth } from '@/contexts/auth-context'

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const router = useRouter()
    const pathname = usePathname()
    const { user, isLoading, isAuthenticated, logout } = useAuth()

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login')
        }
    }, [isLoading, isAuthenticated, router])

    const handleLogout = async () => {
        // Clear auth cookie
        document.cookie = 'avelon:authenticated=; path=/; max-age=0'
        await logout()
    }

    // Get current page from pathname
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

    // Show loading while checking auth
    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-100">
                <div className="text-gray-500">Loading...</div>
            </div>
        )
    }

    // If not authenticated, don't render (redirect will happen)
    if (!isAuthenticated) {
        return null
    }

    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar
                currentPage={getCurrentPage()}
                onNavigate={handleNavigate}
                onLogout={handleLogout}
                userName={user?.name || user?.email || 'Admin'}
            />
            <div className="flex-1 overflow-auto">
                {children}
            </div>
        </div>
    )
}
