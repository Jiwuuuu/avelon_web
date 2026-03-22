/**
 * Local copy of shared types from @/types.
 * Inlined here because the monorepo sibling package is not available
 * on Vercel's build environment.
 */

// ── User ────────────────────────────────────────────

export enum UserRole {
    ADMIN = 'ADMIN',
    BORROWER = 'BORROWER',
    INVESTOR = 'INVESTOR',
}

export enum UserStatus {
    REGISTERED = 'REGISTERED',
    VERIFIED = 'VERIFIED',
    PENDING_KYC = 'PENDING_KYC',
    APPROVED = 'APPROVED',
    CONNECTED = 'CONNECTED',
    REJECTED = 'REJECTED',
    SUSPENDED = 'SUSPENDED',
}

export enum KYCLevel {
    NONE = 'NONE',
    BASIC = 'BASIC',
    STANDARD = 'STANDARD',
    ENHANCED = 'ENHANCED',
}

export enum CreditTier {
    REJECTED = 'REJECTED',
    BASIC = 'BASIC',
    STANDARD = 'STANDARD',
    PREMIUM = 'PREMIUM',
    VIP = 'VIP',
}

export interface UserProfile {
    id: string;
    email: string;
    emailVerified: boolean;
    name: string | null;
    role: UserRole;
    status: UserStatus;
    kycLevel: KYCLevel;
    creditScore: number | null;
    creditTier: CreditTier | null;
    legalName: string | null;
    totalBorrowed: number;
    totalRepaid: number;
    activeLoansCount: number;
    createdAt: Date;
}

// ── Auth ────────────────────────────────────────────

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}

// ── Loan Plan ───────────────────────────────────────

export enum InterestType {
    FLAT = 'FLAT',
    COMPOUND = 'COMPOUND',
}

export interface LoanPlan {
    id: string;
    name: string;
    description: string | null;
    minCreditScore: number;
    minAmount: number;
    maxAmount: number;
    durationOptions: number[];
    interestRate: number;
    interestType: InterestType;
    collateralRatio: number;
    originationFee: number;
    latePenaltyRate: number;
    gracePeriodDays: number;
    extensionAllowed: boolean;
    maxExtensionDays: number;
    extensionFee: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateLoanPlanInput {
    name: string;
    description?: string;
    minCreditScore: number;
    minAmount: number;
    maxAmount: number;
    durationOptions: number[];
    interestRate: number;
    interestType?: InterestType;
    collateralRatio: number;
    originationFee: number;
    latePenaltyRate?: number;
    gracePeriodDays?: number;
    extensionAllowed?: boolean;
    maxExtensionDays?: number;
    extensionFee?: number;
}

// ── Loan ────────────────────────────────────────────

export enum LoanStatus {
    PENDING_COLLATERAL = 'PENDING_COLLATERAL',
    COLLATERAL_DEPOSITED = 'COLLATERAL_DEPOSITED',
    ACTIVE = 'ACTIVE',
    REPAID = 'REPAID',
    LIQUIDATED = 'LIQUIDATED',
    CANCELLED = 'CANCELLED',
    EXPIRED = 'EXPIRED',
}

export enum CollateralHealth {
    HEALTHY = 'HEALTHY',
    WARNING = 'WARNING',
    CRITICAL = 'CRITICAL',
    LIQUIDATION = 'LIQUIDATION',
}

export interface Loan {
    id: string;
    userId: string;
    walletId: string;
    planId: string;
    contractAddress: string | null;
    contractLoanId: number | null;
    principal: number;
    collateralRequired: number;
    collateralDeposited: number;
    duration: number;
    interestRate: number;
    originationFee: number;
    principalOwed: number;
    interestOwed: number;
    feesOwed: number;
    status: LoanStatus;
    startDate: Date | null;
    dueDate: Date | null;
    repaidAt: Date | null;
    liquidatedAt: Date | null;
    extended: boolean;
    extensionDays: number;
    creditScoreSnapshot: number;
    ethPriceSnapshot: number;
    createdAt: Date;
    updatedAt: Date;
}

// ── Loan Transaction ────────────────────────────────

export enum LoanTransactionType {
    COLLATERAL_DEPOSIT = 'COLLATERAL_DEPOSIT',
    LOAN_DISBURSEMENT = 'LOAN_DISBURSEMENT',
    REPAYMENT = 'REPAYMENT',
    COLLATERAL_TOPUP = 'COLLATERAL_TOPUP',
    COLLATERAL_RETURN = 'COLLATERAL_RETURN',
    LIQUIDATION = 'LIQUIDATION',
    FEE_PAYMENT = 'FEE_PAYMENT',
}

export enum TransactionStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    FAILED = 'FAILED',
}

export interface LoanTransaction {
    id: string;
    loanId: string;
    type: LoanTransactionType;
    amount: number;
    status: TransactionStatus;
    transactionHash: string | null;
    blockNumber: number | null;
    fromAddress: string | null;
    toAddress: string | null;
    description: string | null;
    createdAt: Date;
    confirmedAt: Date | null;
}
