import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import '../styles/globals.css'
import { AuthProvider } from '@/contexts/auth-context'

const inter = Inter({ subsets: ['latin'], display: 'swap' })

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    themeColor: '#f97316',
}

export const metadata: Metadata = {
    title: {
        default: 'Avelon — Decentralized Lending Platform',
        template: '%s | Avelon',
    },
    description: 'Avelon — a decentralized crypto lending platform on Ethereum. Invest, borrow, and manage digital assets.',
    keywords: ['avelon', 'crypto lending', 'ethereum', 'defi', 'liquidity pool', 'invest'],
    robots: { index: false, follow: false },
    icons: { icon: '/favicon.ico' },
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" className={inter.className}>
            <body className="antialiased">
                <AuthProvider>
                    {children}
                </AuthProvider>
            </body>
        </html>
    )
}
