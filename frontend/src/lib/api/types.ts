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
  creatorId: string;
  title: string;
  description: string;
  mediaItems: Array<{
    media_id: string;
    url: string;
    hash?: string;
  }>;
  transaction: {
    hash: string;
    blockNumber: number;
    timestamp: number;
    chain: string;
  };
}

export interface VerificationResponse {
  tokenId: string;
  verificationStatus: Array<{
    mediaId: string;
    status: string;
    infringementCheckStatus: string;
    externalInfringements: any[];
    inNetworkInfringements: any[];
  }>;
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
