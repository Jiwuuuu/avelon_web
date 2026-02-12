'use client'

import dynamic from 'next/dynamic'

const LoanPlansContent = dynamic(
    () => import('@/components/pages/LoanPlans'),
    { ssr: false }
)

export default function LoanPlansPage() {
    return <LoanPlansContent />
}
