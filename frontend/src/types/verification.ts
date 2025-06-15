// Yakoa verification types
// Maps to backend /api/verification/* routes

// Yakoa Media Item
export interface YakoaMediaItem {
  media_id: string;
  url: string;
  hash?: string;
  trust_reason?: {
    type: "trusted_platform" | "no_licenses";
    platform_name?: string;
    reason?: string;
  } | null;
}

// Yakoa Transaction Data
export interface YakoaTransaction {
  hash: string;
  blockNumber: number;
  timestamp: number;
  chain: string;
}

// Yakoa License Parent
export interface YakoaLicenseParent {
  token_id: string;
  license_id?: string;
}

// Verification Request (Yakoa API)
export interface VerificationRequest {
  tokenId?: string;
  contractAddress?: string;
  onChainTokenId?: string;
  creatorId: string;
  title: string;
  description: string;
  metadata?: Record<string, any>;
  mediaItems: YakoaMediaItem[];
  transaction: YakoaTransaction;
  licenseParents?: YakoaLicenseParent[];
}

// Yakoa Media Status
export interface YakoaMediaStatus {
  mediaId: string;
  fetchStatus: "pending" | "succeeded" | "failed" | "hash_mismatch";
  url: string;
  trustReason?: {
    type: string;
    platform_name?: string;
    reason?: string;
  } | null;
}

// Yakoa External Infringement
export interface YakoaExternalInfringement {
  brand_id: string;
  brand_name: string;
  confidence: number;
  authorized: boolean;
}

// Yakoa In-Network Infringement
export interface YakoaInNetworkInfringement {
  token_id: string;
  confidence: number;
  licensed: boolean;
}

// Yakoa Infringement Result
export interface YakoaInfringementResult {
  status: "pending" | "succeeded" | "completed" | "failed";
  result: "not_checked" | "clean" | "infringement_detected";
  externalInfringements: YakoaExternalInfringement[];
  inNetworkInfringements: YakoaInNetworkInfringement[];
}

// Verification Response (Yakoa API)
export interface VerificationResponse {
  tokenId: string;
  verificationStatus: YakoaMediaStatus[];
  infringementsResult: YakoaInfringementResult;
}

// API Response wrapper
export interface VerificationApiResponse {
  success: boolean;
  data: VerificationResponse;
  error?: string;
}

// Yakoa Token (complete structure)
export interface YakoaToken {
  id: string;
  registration_tx: {
    hash: string;
    block_number: number;
    timestamp: number;
    chain: string;
  };
  creator_id: string;
  metadata: {
    title: string;
    description: string;
    [key: string]: any;
  };
  media: YakoaMediaItem[];
  license_parents?: YakoaLicenseParent[];
}

// Yakoa Authorization Request
export interface AuthorizationRequest {
  tokenId: string;
  brandId?: string;
  brandName?: string;
  authorizationType: string;
  authorizationData: Record<string, any>;
}

// Yakoa Authorization Response
export interface AuthorizationResponse {
  success: boolean;
  data: any;
  error?: string;
}

// Verification Status Query Response
export interface VerificationStatusResponse {
  success: boolean;
  data: {
    tokenId: string;
    verificationStatus: YakoaMediaStatus[];
    infringementsResult: YakoaInfringementResult;
  };
  error?: string;
}

// Proof9 Verification Result (processed from Yakoa)
export interface Proof9VerificationResult {
  verified: boolean;
  confidence: number;
  originality: string;
  tokenId?: string;
  details?: string;
  infringementDetails?: YakoaInfringementResult;
}
