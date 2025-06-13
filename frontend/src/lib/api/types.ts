import { Track as DbTrack } from "@/lib/db/schemas";
import { LegacyTrack as Track } from "@/types/track";

// Backend API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  error?: string;
}

// Format audio URL to ensure proper IPFS gateway access
function formatAudioUrl(ipfsUrl: string): string {
  console.log("formatAudioUrl - Original URL:", ipfsUrl);

  // If it's already a full HTTP URL, return as is
  if (ipfsUrl.startsWith("http://") || ipfsUrl.startsWith("https://")) {
    console.log("formatAudioUrl - Already HTTP(S), returning as is");
    return ipfsUrl;
  }

  // If it's an IPFS hash only (QmXXX...), prepend gateway
  if (ipfsUrl.startsWith("Qm") || ipfsUrl.startsWith("ba")) {
    const gatewayUrl = `https://gateway.pinata.cloud/ipfs/${ipfsUrl}`;
    console.log("formatAudioUrl - IPFS hash, using gateway:", gatewayUrl);
    return gatewayUrl;
  }

  // If it's ipfs:// protocol, convert to gateway
  if (ipfsUrl.startsWith("ipfs://")) {
    const hash = ipfsUrl.replace("ipfs://", "");
    const gatewayUrl = `https://gateway.pinata.cloud/ipfs/${hash}`;
    console.log("formatAudioUrl - IPFS protocol, using gateway:", gatewayUrl);
    return gatewayUrl;
  }

  console.log("formatAudioUrl - Unknown format, returning as is");
  return ipfsUrl;
}

// Transform database Track to LegacyTrack for component compatibility
export function transformDbTrackToLegacy(
  dbTrack: DbTrack & { artistAvatarUrl?: string; artistUsername?: string },
): Track {
  return {
    id: dbTrack.id,
    title: dbTrack.title,
    artist: dbTrack.artist_name || "Unknown Artist",
    artistAddress: dbTrack.artist_address,
    artistUsername: dbTrack.artistUsername || undefined,
    artistAvatarUrl: dbTrack.artistAvatarUrl || undefined,
    duration: dbTrack.duration || "0:00",
    plays: dbTrack.plays,
    verified: dbTrack.verified,
    imageUrl: dbTrack.image_url || undefined,
    audioUrl: dbTrack.ipfs_url ? formatAudioUrl(dbTrack.ipfs_url) : undefined,
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

// Registration & Verification (Story Protocol Compliant)
export interface RegistrationRequest {
  // === IP METADATA (Story Protocol IPA Standard) ===
  title: string;
  description: string;

  // Story Protocol creators array
  creators: Array<{
    name: string;
    address: string;
    contributionPercent: number;
    description?: string;
    socialMedia?: Array<{
      platform: string;
      url: string;
    }>;
  }>;

  // Cover art (Story Protocol image.* fields)
  imageUrl: string;
  imageHash: string;

  // Audio file (Story Protocol media.* fields)
  mediaUrl: string;
  mediaHash: string;
  mediaType: string;

  // === NFT METADATA (ERC-721 Standard) ===
  nftName?: string;
  nftDescription?: string;
  attributes?: Array<{
    key: string;
    value: string;
  }>;

  // === LICENSE TERMS ===
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
