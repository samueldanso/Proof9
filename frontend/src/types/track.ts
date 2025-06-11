// Import types from our clean database schema
export type {
  Track,
  LicenseTransaction,
  RevenueClaim,
  Profile as UserProfile,
  Like,
  Comment,
  Follow,
} from "@/lib/db/schemas";

// Legacy interfaces for backward compatibility with existing components
export interface LegacyTrack {
  id: string;
  title: string;
  artist: string;
  artistAddress: string;
  artistUsername?: string; // Add username for navigation
  artistAvatarUrl?: string;
  duration: string;
  plays: number;
  verified: boolean;
  imageUrl?: string;
  audioUrl?: string;
  isLiked: boolean;
  likes: number;
  comments: number;
  description?: string;
  genre?: string;
  createdAt?: string;
  license?: {
    type: string;
    price: string;
    available: boolean;
    terms: string;
    downloads: number;
  };
}
