// Story Protocol royalty types
// Maps to backend /api/royalty/* routes

// Pay Royalty Request
export interface PayRoyaltyRequest {
  receiverIpId: string; // Story Protocol IP Asset ID receiving payment
  payerIpId?: string; // Story Protocol IP Asset ID making payment (optional)
  token?: string; // Token address (default: native token)
  amount: number; // Amount to pay
  createDerivative?: {
    parentIpId: string;
    licenseTermsId: string;
    metadata?: any;
  };
}

// Pay Royalty Response
export interface PayRoyaltyResponse {
  transactionHash: string;
  amountPaid: string;
  token: string;
  receiverIpId: string;
  payerIpId?: string;
  derivativeIpId?: string; // If derivative was created
  explorerUrl: string;
}

// Claim Royalty Request
export interface ClaimRoyaltyRequest {
  ancestorIpId: string; // Story Protocol IP Asset ID to claim from
  claimer?: string; // Address claiming (default: caller)
  childIpIds?: string[]; // Child IP Asset IDs (optional)
  royaltyPolicies?: string[]; // Royalty policy addresses (optional)
  currencyTokens?: string[]; // Currency token addresses (optional)
}

// Claim Royalty Response
export interface ClaimRoyaltyResponse {
  transactionHash: string;
  amountsClaimed: string[];
  tokens: string[];
  ancestorIpId: string;
  claimer: string;
  explorerUrl: string;
}

// Transfer Royalty Request
export interface TransferRoyaltyRequest {
  ipId: string; // Story Protocol IP Asset ID
  newOwner: string; // New owner address
  percentage?: number; // Percentage to transfer (default: 100)
}

// Transfer Royalty Response
export interface TransferRoyaltyResponse {
  transactionHash: string;
  ipId: string;
  previousOwner: string;
  newOwner: string;
  percentageTransferred: number;
  explorerUrl: string;
}

// Royalty API Response wrappers
export interface PayRoyaltyApiResponse {
  success: boolean;
  data: PayRoyaltyResponse;
  error?: string;
}

export interface ClaimRoyaltyApiResponse {
  success: boolean;
  data: ClaimRoyaltyResponse;
  error?: string;
}

export interface TransferRoyaltyApiResponse {
  success: boolean;
  data: TransferRoyaltyResponse;
  error?: string;
}

// Royalty Token (Story Protocol)
export interface RoyaltyToken {
  ipId: string;
  token: string; // Token contract address
  balance: string; // Available balance
  claimed: string; // Total claimed
  pending: string; // Pending claims
}

// Revenue Claim (Database record)
export interface RevenueClaim {
  id: string;
  creator_address: string;
  ip_id: string;
  amount_claimed: number;
  token_address: string;
  transaction_hash: string;
  claimed_at: string;
}

// Creator Earnings Summary
export interface CreatorEarnings {
  totalRevenue: number;
  totalLicensesSold: number;
  totalClaimed: number;
  pendingRevenue: number;
  trackCount: number;
}

// Creator Earnings API Response
export interface CreatorEarningsApiResponse {
  success: boolean;
  data: CreatorEarnings;
  error?: string;
}

// Royalty Distribution (for IP with multiple creators)
export interface RoyaltyDistribution {
  ipId: string;
  totalRevenue: string;
  distributions: Array<{
    creator: string;
    percentage: number;
    amount: string;
    claimed: boolean;
  }>;
}

// Royalty Policy Info
export interface RoyaltyPolicyInfo {
  policyAddress: string;
  ipId: string;
  royaltyStack: number; // Percentage
  targetAncestors: string[]; // IP Asset IDs
  targetRoyaltyAmount: string[];
}

// Royalty Vault Info
export interface RoyaltyVaultInfo {
  ipId: string;
  ancestorIpId: string;
  ancestorRoyaltyPolicy: string;
  unclaimedRoyaltyTokens: Array<{
    token: string;
    amount: string;
  }>;
}

// Derivative Revenue Sharing
export interface DerivativeRevenueShare {
  parentIpId: string;
  derivativeIpId: string;
  parentShare: number; // Percentage
  derivativeShare: number; // Percentage
  totalRevenue: string;
  parentEarnings: string;
  derivativeEarnings: string;
}
