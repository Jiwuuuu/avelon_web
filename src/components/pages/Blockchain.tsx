"use client"

import { Blocks, Globe, Wallet, FileCode2, Database, Link2, AlertTriangle, RefreshCw } from "lucide-react"
import { useCachedFetch } from "@/lib/use-cached-fetch"

type BlockchainData = {
    online: boolean
    network: { name: string; chainId: string }
    blockNumber: number
    deployer: { address: string | null; balance: string }
    contracts: {
        avelonLending: string | null
        collateralManager: string | null
        repaymentSchedule: string | null
    }
    treasury: { address: string | null; balance: string }
    collateralPool: { address: string | null; balance: string }
    onChainLoanCount: number
    _warning?: string
}

const ETHERSCAN_BASE = "https://sepolia.etherscan.io"

function truncateAddress(addr: string | null) {
    if (!addr) return "—"
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

function etherscanLink(type: "address" | "tx", value: string) {
    return `${ETHERSCAN_BASE}/${type}/${value}`
}

function AddressRow({ label, address }: { label: string; address: string | null }) {
    return (
        <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
            <span className="text-sm text-gray-500">{label}</span>
            {address ? (
                <a
                    href={etherscanLink("address", address)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm font-mono text-orange-600 hover:text-orange-700 transition"
                >
                    {truncateAddress(address)}
                    <Link2 size={13} />
                </a>
            ) : (
                <span className="text-sm text-gray-400">Not configured</span>
            )}
        </div>
    )
}

export default function Blockchain() {
    const { data, loading, error, refresh } = useCachedFetch<BlockchainData>("/api/v1/admin/blockchain")

    return (
        <div className="bg-gray-50 min-h-full">
            <div className="p-8 space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-3xl font-bold text-gray-900">Blockchain</h1>
                        <p className="text-sm text-gray-500">On-chain network status, deployed contracts, and balances.</p>
                    </div>
                    <button
                        onClick={refresh}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition disabled:opacity-50"
                    >
                        <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                        Refresh
                    </button>
                </div>

                {/* Loading */}
                {loading && (
                    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="rounded-2xl bg-white p-6 shadow-sm animate-pulse">
                                <div className="h-4 bg-gray-200 rounded w-20 mb-4" />
                                <div className="h-8 bg-gray-200 rounded w-32" />
                            </div>
                        ))}
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="rounded-xl bg-red-50 border border-red-200 p-6 text-center">
                        <p className="text-red-700 font-medium">{error}</p>
                        <button onClick={refresh} className="mt-3 text-sm text-red-600 hover:text-red-800 font-semibold">Retry</button>
                    </div>
                )}

                {!loading && !error && data && (
                    <>
                        {/* Warning banner if offline */}
                        {!data.online && (
                            <div className="flex items-center gap-3 rounded-xl bg-amber-50 border border-amber-200 p-4">
                                <AlertTriangle size={18} className="text-amber-600 flex-shrink-0" />
                                <p className="text-sm text-amber-800">
                                    <strong>Blockchain unreachable.</strong> Showing cached contract addresses only. Balances may be stale.
                                </p>
                            </div>
                        )}

                        {/* Top Stats Row */}
                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                            {/* Network Status */}
                            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <span className={`rounded-2xl p-3 ${data.online ? "bg-green-50" : "bg-red-50"}`}>
                                        <Globe size={18} className={data.online ? "text-green-600" : "text-red-600"} />
                                    </span>
                                    <div>
                                        <p className="text-xs uppercase tracking-wide text-gray-400">Network</p>
                                        <p className="text-lg font-semibold text-gray-900 capitalize">{data.network.name}</p>
                                        <p className="text-xs text-gray-500">Chain ID: {data.network.chainId}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Block Number */}
                            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <span className="rounded-2xl bg-indigo-50 p-3">
                                        <Blocks size={18} className="text-indigo-600" />
                                    </span>
                                    <div>
                                        <p className="text-xs uppercase tracking-wide text-gray-400">Latest Block</p>
                                        <p className="text-lg font-semibold text-gray-900">{data.blockNumber.toLocaleString()}</p>
                                        <p className="text-xs text-gray-500">{data.online ? "Live" : "Offline"}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Treasury Balance */}
                            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <span className="rounded-2xl bg-emerald-50 p-3">
                                        <Wallet size={18} className="text-emerald-600" />
                                    </span>
                                    <div>
                                        <p className="text-xs uppercase tracking-wide text-gray-400">Treasury Balance</p>
                                        <p className="text-lg font-semibold text-gray-900">{parseFloat(data.treasury.balance).toFixed(4)} ETH</p>
                                        <p className="text-xs text-gray-500 font-mono">{truncateAddress(data.treasury.address)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Collateral Pool */}
                            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <span className="rounded-2xl bg-amber-50 p-3">
                                        <Database size={18} className="text-amber-600" />
                                    </span>
                                    <div>
                                        <p className="text-xs uppercase tracking-wide text-gray-400">Collateral Locked</p>
                                        <p className="text-lg font-semibold text-gray-900">{parseFloat(data.collateralPool.balance).toFixed(4)} ETH</p>
                                        <p className="text-xs text-gray-500 font-mono">{truncateAddress(data.collateralPool.address)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Row */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Deployed Contracts */}
                            <div className="rounded-3xl bg-white p-6 shadow-sm">
                                <div className="flex items-center gap-2 mb-4">
                                    <FileCode2 size={18} className="text-gray-400" />
                                    <h2 className="text-lg font-semibold text-gray-900">Deployed Contracts</h2>
                                </div>
                                <div>
                                    <AddressRow label="AvelonLending" address={data.contracts.avelonLending} />
                                    <AddressRow label="CollateralManager" address={data.contracts.collateralManager} />
                                    <AddressRow label="RepaymentSchedule" address={data.contracts.repaymentSchedule} />
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                                    <span className="text-sm text-gray-500">On-Chain Loan Count</span>
                                    <span className="text-sm font-semibold text-gray-900">{data.onChainLoanCount}</span>
                                </div>
                            </div>

                            {/* Deployer / Admin Wallet */}
                            <div className="rounded-3xl bg-white p-6 shadow-sm">
                                <div className="flex items-center gap-2 mb-4">
                                    <Wallet size={18} className="text-gray-400" />
                                    <h2 className="text-lg font-semibold text-gray-900">Deployer Wallet</h2>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">Address</p>
                                        {data.deployer.address ? (
                                            <a
                                                href={etherscanLink("address", data.deployer.address)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1.5 text-sm font-mono text-orange-600 hover:text-orange-700 transition"
                                            >
                                                {data.deployer.address}
                                                <Link2 size={13} />
                                            </a>
                                        ) : (
                                            <p className="text-sm text-gray-400">Not available</p>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">ETH Balance</p>
                                        <p className="text-2xl font-semibold text-gray-900">{parseFloat(data.deployer.balance).toFixed(4)} ETH</p>
                                        <p className="text-xs text-gray-500 mt-1">Used for gas fees on contract transactions</p>
                                    </div>
                                </div>

                                {/* Network status badge */}
                                <div className={`mt-6 flex items-center justify-between p-3 rounded-lg border ${data.online ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
                                    <span className="text-sm font-medium">Contract Status</span>
                                    <span className={`text-xs font-semibold ${data.online ? "text-green-600" : "text-red-600"}`}>
                                        {data.online ? "LIVE" : "OFFLINE"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </>
                )}

            </div>
        </div>
    )
}
