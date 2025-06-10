import { Track } from "@/types/track";

// Backend API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  error?: string;
}

// Registration & Verification
export interface RegistrationRequest {
  ipMetadata: {
    title: string;
    description: string;
    creators: Array<{
      name: string;
      address: string;
      contributionPercent: number;
    }>;
    image: string;
    mediaUrl?: string;
    mediaType?: string;
  };
  nftMetadata: {
    name: string;
    description: string;
    image: string;
    attributes?: Array<{
      key: string;
      value: string;
    }>;
  };
  commercialRemixTerms?: {
    defaultMintingFee: number;
    commercialRevShare: number;
  };
}

export interface RegistrationResponse {
  transactionHash: string;
  ipId: string;
  licenseTermsIds: string[];
  explorerUrl: string;
}

export interface VerificationRequest {
  tokenId?: string;
  contractAddress?: string;
  onChainTokenId?: string;
  creatorId: string; // Must be valid Ethereum address
  title: string;
  description: string;
  metadata?: Record<string, any>;
  mediaItems: Array<{
    media_id: string;
    url: string;
    hash?: string;
    trust_reason?:
      | {
          platform: string;
        }
      | {
          reason: "no_licenses";
        }
      | null;
  }>;
  transaction: {
    hash: string; // Must be 32-byte hex string
    blockNumber: number;
    timestamp: number;
    chain: string;
  };
  licenseParents?: Array<{
    token_id: string;
    license_id?: string;
  }>;
}

export interface VerificationResponse {
  success: boolean;
  data: {
    tokenId: string;
    verificationStatus: Array<{
      mediaId: string;
      status?: string;
      infringementCheckStatus?: string;
      externalInfringements?: Array<{
        brand_id: string;
        brand_name: string;
        confidence: number;
        authorized: boolean;
      }>;
      inNetworkInfringements?: Array<{
        token_id: string;
        confidence: number;
        licensed: boolean;
      }>;
    }>;
  };
  error?: string;
}

// Track Data Bridge (Backend IP Asset -> Frontend Track)
export interface IpAsset {
  ipId: string;
  metadata: {
    title: string;
    description: string;
    creators: Array<{
      name: string;
      address: string;
      contributionPercent: number;
    }>;
    image: string;
    mediaUrl?: string;
  };
  verified: boolean;
  transactionHash: string;
  explorerUrl: string;
}

// Transform function type
export type TrackTransformer = (ipAsset: IpAsset) => Track;
