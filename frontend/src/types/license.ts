// Story Protocol license types
// Maps to backend /api/licenses/* routes

// License Minting Request
export interface MintLicenseRequest {
  licensorIpId: string; // Story Protocol IP Asset ID
  licenseTermsId: string; // Story Protocol License Terms ID
  amount?: number; // Number of licenses to mint (default: 1)
  receiver?: string; // Address to receive the license (default: caller)
}

// License Minting Response
export interface MintLicenseResponse {
  transactionHash: string;
  licenseTokenIds: string[]; // Array of minted license token IDs
  startLicenseTokenId: string;
  explorerUrl: string;
}

// License API Response wrapper
export interface LicenseApiResponse {
  success: boolean;
  data: MintLicenseResponse;
  error?: string;
}

// PIL (Programmable IP License) Terms
export interface PILTerms {
  transferable: boolean;
  royaltyPolicy: string;
  defaultMintingFee: string;
  expiration: string;
  commercialUse: boolean;
  commercialAttribution: boolean;
  commercializerChecker: string;
  commercializerCheckerData: string;
  commercialRevShare: number; // 0-100 percentage
  commercialRevCeiling: string;
  derivativesAllowed: boolean;
  derivativesAttribution: boolean;
  derivativesApproval: boolean;
  derivativesReciprocal: boolean;
  derivativeRevCeiling: string;
  currency: string;
  uri: string;
}

// License Terms Creation Request
export interface CreateLicenseTermsRequest {
  terms: PILTerms;
}

// License Terms Creation Response
export interface CreateLicenseTermsResponse {
  transactionHash: string;
  licenseTermsId: string;
  explorerUrl: string;
}

// Attach License Terms Request
export interface AttachLicenseTermsRequest {
  ipId: string;
  licenseTermsId: string;
}

// Attach License Terms Response
export interface AttachLicenseTermsResponse {
  transactionHash: string;
  explorerUrl: string;
}

// License Token Info
export interface LicenseTokenInfo {
  tokenId: string;
  licensorIpId: string;
  licenseTermsId: string;
  owner: string;
  transferable: boolean;
  commercialUse: boolean;
  derivativesAllowed: boolean;
  mintingFee: string;
  commercialRevShare: number;
  expirationTime: string;
}

// One-Time Use License Request (with hooks)
export interface OneTimeUseLicenseRequest {
  ipId: string;
  licenseTermsId: string;
  maxTokens: number; // Token limit via hooks
  recipient?: string;
}

// One-Time Use License Response
export interface OneTimeUseLicenseResponse {
  transactionHash: string;
  licenseTokenId: string;
  maxTokensAllowed: number;
  explorerUrl: string;
}

// License Purchase Transaction
export interface LicensePurchaseTransaction {
  id: string;
  buyer_address: string;
  track_id: string;
  license_token_id: string;
  license_terms_id: string;
  price_paid: number;
  currency: string;
  transaction_hash: string;
  created_at: string;
  // Track details (joined)
  tracks?: {
    id: string;
    title: string;
    artist_name: string;
    artist_address: string;
    duration: string;
    ipfs_url: string;
    genre: string;
    created_at: string;
  };
}

// User Licensed Tracks Response
export interface UserLicensedTracksResponse {
  success: boolean;
  data: LicensePurchaseTransaction[];
  error?: string;
}

// License Usage Rights
export interface LicenseUsageRights {
  commercial: boolean;
  derivatives: boolean;
  attribution: boolean;
  transferable: boolean;
  territory: string;
  duration: string;
  exclusivity: "exclusive" | "non-exclusive";
}

// License Pricing Tiers
export interface LicensePricingTier {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  usage: LicenseUsageRights;
  popular?: boolean;
}

// Standard License Types (Proof9 presets)
export const LICENSE_TYPES = {
  PERSONAL: "personal",
  COMMERCIAL: "commercial",
  REMIX: "remix",
  SYNC: "sync",
  EXCLUSIVE: "exclusive",
} as const;

export type LicenseType = (typeof LICENSE_TYPES)[keyof typeof LICENSE_TYPES];

// License Template (Proof9 UI)
export interface LicenseTemplate {
  type: LicenseType;
  name: string;
  description: string;
  basePrice: number;
  usage: LicenseUsageRights;
  pilTerms: Partial<PILTerms>;
}
