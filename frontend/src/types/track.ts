// Story Protocol Track types - EXACT NAMING ONLY

// Story Protocol Track - EXACT format from backend
export interface Track {
  // Story Protocol IPA Standard
  id: string;
  title: string;
  description?: string;
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

  // Story Protocol image.* fields
  image?: string;
  imageHash?: string;

  // Story Protocol media.* fields
  mediaUrl?: string;
  mediaHash?: string;
  mediaType?: string;

  // Additional metadata
  genre?: string;
  tags?: string[];
  duration?: string;

  // Social stats
  plays?: number;
  likes?: number;
  comments?: number;

  // Story Protocol data
  ipId?: string;
  tokenId?: string;
  transactionHash?: string;
  licenseTermsIds?: string[];

  // Verification
  verified?: boolean;
  yakoaTokenId?: string;

  // Timestamps
  createdAt?: string;

  // Profile data for UI (social features)
  creatorUsername?: string;
  creatorAvatarUrl?: string;
}

// Import database schema types
export type {
  LicenseTransaction,
  RevenueClaim,
  Profile as UserProfile,
  Like,
  Comment,
  Follow,
} from "@/lib/db/schemas";
