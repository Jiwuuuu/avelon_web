'use client'

import dynamic from 'next/dynamic'

const VolatilityContent = dynamic(
    () => import('@/components/pages/Volatility'),
    { ssr: false }
)

export default function VolatilityPage() {
    return <VolatilityContent />
}
