import { Track as DbTrack } from "@/lib/db/schemas";
import { LegacyTrack as Track } from "@/types/track";

// Backend API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  error?: string;
}

// Transform database Track to LegacyTrack for component compatibility
export function transformDbTrackToLegacy(dbTrack: DbTrack): Track {
  return {
    id: dbTrack.id,
    title: dbTrack.title,
    artist: dbTrack.artist_name || "Unknown Artist",
    artistAddress: dbTrack.artist_address,
    duration: dbTrack.duration || "0:00",
    plays: dbTrack.plays,
    verified: dbTrack.verified,
    imageUrl: dbTrack.image_url || undefined,
    audioUrl: dbTrack.ipfs_url || undefined,
    isLiked: false as boolean, // This would need to be determined by checking likes table
    likes: dbTrack.likes_count,
    comments: dbTrack.comments_count,
    description: dbTrack.description || undefined,
    genre: dbTrack.genre || undefined,
    createdAt: dbTrack.created_at,
    license: dbTrack.license_type
      ? {
          type: dbTrack.license_type,
          price: dbTrack.license_price?.toString() || "0",
          available: true,
          terms: "Commercial use allowed with revenue sharing",
          downloads: dbTrack.total_licenses_sold,
        }
      : undefined,
  };
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
          type: "trusted_platform";
          platform_name: string;
        }
      | {
          type: "no_licenses";
          reason: string;
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
  tokenId: string;
  verificationStatus: Array<{
    mediaId: string;
    fetchStatus?: string;
    url?: string;
    trustReason?: {
      type: string;
      platform_name?: string;
      reason?: string;
    };
  }>;
  infringementsResult?: {
    status?: string;
    result?: string;
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
  };
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
