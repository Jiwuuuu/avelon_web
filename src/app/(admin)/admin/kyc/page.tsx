'use client'

import dynamic from 'next/dynamic'

const KycReviewContent = dynamic(
    () => import('@/components/pages/KycReview'),
    { ssr: false }
)

export default function KycReviewPage() {
    return <KycReviewContent />
}
