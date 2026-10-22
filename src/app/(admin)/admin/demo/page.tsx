'use client'

import dynamic from 'next/dynamic'

const DemoControlsContent = dynamic(
    () => import('@/components/pages/DemoControls'),
    { ssr: false }
)

export default function DemoControlsPage() {
    return <DemoControlsContent />
}
