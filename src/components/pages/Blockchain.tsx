"use client"

import { useState } from "react"
import { ethers } from "ethers"
import { Blocks, Globe, Wallet, FileCode2, Database, Link2, AlertTriangle, RefreshCw, Zap, Send, CheckCircle2, XCircle } from "lucide-react"
import { useCachedFetch } from "@/lib/use-cached-fetch"

const COLLATERAL_MANAGER_ADDRESS = "0x4CFf8B5c2f7378EFcC3cD6Aab4f813c08Cf9358e"
const TREASURY_ADDRESS = "0x38f00aD0B7f04CF4772A60349Bcfff7035082cd4"
const SEPOLIA_CHAIN_ID_HEX = "0xaa36a7"

const COLLATERAL_MANAGER_ABI = [
    {
        inputs: [{ internalType: "uint32", name: "loanId", type: "uint32" }],
        name: "depositCollateral",
        outputs: [],
        stateMutability: "payable",
        type: "function",
    },
] as const

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

    // --- Wallet state ---
    const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null)
    const [walletAddress, setWalletAddress] = useState("")
    const [connectError, setConnectError] = useState("")
    const [isConnecting, setIsConnecting] = useState(false)

    // --- Deposit state ---
    const [depositLoanId, setDepositLoanId] = useState("")
    const [depositAmount, setDepositAmount] = useState("")
    const [depositTx, setDepositTx] = useState("")
    const [depositError, setDepositError] = useState("")
    const [isDepositing, setIsDepositing] = useState(false)

    // --- Repay state ---
    const [repayLoanId, setRepayLoanId] = useState("")
    const [repayAmount, setRepayAmount] = useState("")
    const [repayTx, setRepayTx] = useState("")
    const [repayError, setRepayError] = useState("")
    const [isRepaying, setIsRepaying] = useState(false)

    async function connectWallet() {
        setConnectError("")
        setIsConnecting(true)
        const eth = (window as any).ethereum
        if (!eth) {
            setConnectError("MetaMask not found. Install the MetaMask browser extension and refresh the page.")
            setIsConnecting(false)
            return
        }
        try {
            await eth.request({ method: "eth_requestAccounts" })
            // Switch to Sepolia
            try {
                await eth.request({ method: "wallet_switchEthereumChain", params: [{ chainId: SEPOLIA_CHAIN_ID_HEX }] })
            } catch {
                await eth.request({
                    method: "wallet_addEthereumChain",
                    params: [{
                        chainId: SEPOLIA_CHAIN_ID_HEX,
                        chainName: "Sepolia Test Network",
                        rpcUrls: ["https://rpc.sepolia.org"],
                        nativeCurrency: { name: "SepoliaETH", symbol: "ETH", decimals: 18 },
                        blockExplorerUrls: ["https://sepolia.etherscan.io"],
                    }],
                })
            }
            const provider = new ethers.BrowserProvider(eth)
            const s = await provider.getSigner()
            setSigner(s)
            setWalletAddress(await s.getAddress())
        } catch (e: any) {
            setConnectError(e.message ?? "Connection failed")
        } finally {
            setIsConnecting(false)
        }
    }

    async function handleDeposit() {
        setDepositError("")
        setDepositTx("")
        if (!signer) { setDepositError("Connect wallet first."); return }
        if (!depositLoanId || !depositAmount) { setDepositError("Fill in both fields."); return }
        setIsDepositing(true)
        try {
            const contract = new ethers.Contract(COLLATERAL_MANAGER_ADDRESS, COLLATERAL_MANAGER_ABI, signer)
            const tx = await (contract as any).depositCollateral(parseInt(depositLoanId), {
                value: ethers.parseEther(depositAmount),
            })
            const receipt = await tx.wait()
            setDepositTx(receipt.hash)
        } catch (e: any) {
            setDepositError(e.reason ?? e.shortMessage ?? e.message ?? "Transaction failed")
        } finally {
            setIsDepositing(false)
        }
    }

    async function handleRepay() {
        setRepayError("")
        setRepayTx("")
        if (!signer) { setRepayError("Connect wallet first."); return }
        if (!repayLoanId || !repayAmount) { setRepayError("Fill in both fields."); return }
        setIsRepaying(true)
        try {
            const tx = await signer.sendTransaction({
                to: TREASURY_ADDRESS,
                value: ethers.parseEther(repayAmount),
            })
            const receipt = await tx.wait()
            setRepayTx(receipt!.hash)
        } catch (e: any) {
            setRepayError(e.reason ?? e.shortMessage ?? e.message ?? "Transaction failed")
        } finally {
            setIsRepaying(false)
        }
    }

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

                {/* On-Chain Tools */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Zap size={18} className="text-orange-500" />
                        <h2 className="text-xl font-bold text-gray-900">On-Chain Tools</h2>
                        <span className="text-xs bg-amber-100 text-amber-700 font-semibold px-2 py-0.5 rounded-full">Sepolia</span>
                    </div>

                    {/* Wallet Connection Bar */}
                    <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex-1">
                            {walletAddress ? (
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 size={16} className="text-green-500" />
                                    <span className="text-sm font-medium text-gray-700">Connected:</span>
                                    <span className="text-sm font-mono text-green-700">{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</span>
                                    <a href={etherscanLink("address", walletAddress)} target="_blank" rel="noopener noreferrer" className="text-xs text-orange-500 hover:text-orange-700">
                                        <Link2 size={12} />
                                    </a>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500">Connect MetaMask to perform on-chain transactions from this dashboard.</p>
                            )}
                            {connectError && (
                                <p className="mt-1 text-xs text-red-600 flex items-center gap-1.5">
                                    <XCircle size={12} />{connectError}
                                </p>
                            )}
                        </div>
                        {!walletAddress ? (
                            <button
                                onClick={connectWallet}
                                disabled={isConnecting}
                                className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition disabled:opacity-60 whitespace-nowrap"
                            >
                                <Wallet size={15} />
                                {isConnecting ? "Connecting..." : "Connect MetaMask"}
                            </button>
                        ) : (
                            <button
                                onClick={() => { setSigner(null); setWalletAddress("") }}
                                className="text-sm text-gray-400 hover:text-gray-600 underline whitespace-nowrap"
                            >
                                Disconnect
                            </button>
                        )}
                    </div>

                    {/* Tools Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                        {/* Deposit Collateral */}
                        <div className="rounded-3xl bg-white p-6 shadow-sm border border-gray-100">
                            <div className="flex items-center gap-2 mb-1">
                                <Database size={18} className="text-amber-500" />
                                <h3 className="text-base font-semibold text-gray-900">Deposit Collateral</h3>
                            </div>
                            <p className="text-xs text-gray-400 mb-5">
                                Calls <span className="font-mono">CollateralManager.depositCollateral(loanId)</span> with ETH. Activates the loan on-chain.
                            </p>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Contract Loan ID</label>
                                    <input
                                        type="number" min="0" placeholder="e.g. 1"
                                        value={depositLoanId} onChange={e => setDepositLoanId(e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Collateral Amount (ETH)</label>
                                    <input
                                        type="number" step="0.0001" min="0" placeholder="e.g. 0.03"
                                        value={depositAmount} onChange={e => setDepositAmount(e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
                                    />
                                </div>
                            </div>
                            <button
                                onClick={handleDeposit}
                                disabled={isDepositing || !walletAddress}
                                className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-xl transition disabled:opacity-50"
                            >
                                {isDepositing ? <RefreshCw size={14} className="animate-spin" /> : <Database size={14} />}
                                {isDepositing ? "Sending..." : "Deposit Collateral"}
                            </button>
                            {depositError && (
                                <div className="mt-3 flex items-start gap-2 p-3 bg-red-50 rounded-lg border border-red-200">
                                    <XCircle size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
                                    <p className="text-xs text-red-700">{depositError}</p>
                                </div>
                            )}
                            {depositTx && (
                                <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                                    <p className="text-xs font-medium text-green-700 mb-1 flex items-center gap-1.5">
                                        <CheckCircle2 size={13} /> Transaction confirmed!
                                    </p>
                                    <a
                                        href={etherscanLink("tx", depositTx)} target="_blank" rel="noopener noreferrer"
                                        className="text-xs font-mono text-orange-600 hover:text-orange-800 break-all"
                                    >
                                        {depositTx}
                                    </a>
                                    <p className="text-xs text-gray-500 mt-2">Copy this tx hash and paste it into the mobile app to confirm the deposit.</p>
                                </div>
                            )}
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <p className="text-xs text-gray-400">Contract: <span className="font-mono">{truncateAddress(COLLATERAL_MANAGER_ADDRESS)}</span></p>
                            </div>
                        </div>

                        {/* Repay Loan */}
                        <div className="rounded-3xl bg-white p-6 shadow-sm border border-gray-100">
                            <div className="flex items-center gap-2 mb-1">
                                <Send size={18} className="text-indigo-500" />
                                <h3 className="text-base font-semibold text-gray-900">Repay Loan</h3>
                            </div>
                            <p className="text-xs text-gray-400 mb-5">
                                Sends ETH to the treasury wallet. The backend then records the repayment on-chain via the deployer wallet.
                            </p>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Contract Loan ID</label>
                                    <input
                                        type="number" min="0" placeholder="e.g. 1"
                                        value={repayLoanId} onChange={e => setRepayLoanId(e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Repayment Amount (ETH)</label>
                                    <input
                                        type="number" step="0.0001" min="0" placeholder="e.g. 0.052"
                                        value={repayAmount} onChange={e => setRepayAmount(e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
                                    />
                                </div>
                            </div>
                            <button
                                onClick={handleRepay}
                                disabled={isRepaying || !walletAddress}
                                className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition disabled:opacity-50"
                            >
                                {isRepaying ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
                                {isRepaying ? "Sending..." : "Send Repayment"}
                            </button>
                            {repayError && (
                                <div className="mt-3 flex items-start gap-2 p-3 bg-red-50 rounded-lg border border-red-200">
                                    <XCircle size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
                                    <p className="text-xs text-red-700">{repayError}</p>
                                </div>
                            )}
                            {repayTx && (
                                <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                                    <p className="text-xs font-medium text-green-700 mb-1 flex items-center gap-1.5">
                                        <CheckCircle2 size={13} /> Transaction confirmed!
                                    </p>
                                    <a
                                        href={etherscanLink("tx", repayTx)} target="_blank" rel="noopener noreferrer"
                                        className="text-xs font-mono text-orange-600 hover:text-orange-800 break-all"
                                    >
                                        {repayTx}
                                    </a>
                                    <p className="text-xs text-gray-500 mt-2">Copy this tx hash and paste it into the mobile app to confirm the repayment.</p>
                                </div>
                            )}
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <p className="text-xs text-gray-400">Treasury: <span className="font-mono">{truncateAddress(TREASURY_ADDRESS)}</span></p>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    )
}
