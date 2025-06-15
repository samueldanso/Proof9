// User types
// Maps to backend /api/users/* routes

// User Profile
export interface UserProfile {
  address: string;
  username: string | null;
  displayName: string;
  avatar_url?: string | null;
  verified: boolean;
  trackCount: number;
  followingCount: number;
  followersCount: number;
  joinedAt: string; // Date string
  tracks: string[]; // Array of track IDs
}

// Create Profile Request
export interface CreateProfileRequest {
  address: string;
  display_name: string;
  avatar_url?: string | null;
}

// Update Profile Request
export interface UpdateProfileRequest {
  display_name: string;
  username?: string;
  avatar_url?: string | null;
}

// Profile API Responses
export interface UserProfileApiResponse {
  success: boolean;
  data: UserProfile;
  error?: string;
}

export interface CreateProfileApiResponse {
  success: boolean;
  data: {
    address: string;
    username: string;
    display_name: string;
    avatar_url: string | null;
    verified: boolean;
    created_at: string;
    updated_at: string;
  };
  error?: string;
}

export interface UpdateProfileApiResponse {
  success: boolean;
  data: {
    address: string;
    username: string;
    display_name: string;
    avatar_url: string | null;
    verified: boolean;
    updated_at: string;
  };
  error?: string;
}

// Username Availability
export interface UsernameAvailability {
  available: boolean;
  reason?: string;
}

export interface UsernameAvailabilityApiResponse {
  success: boolean;
  data: UsernameAvailability;
  error?: string;
}

// Onboarding Status
export interface OnboardingStatus {
  hasProfile: boolean;
}

export interface OnboardingStatusApiResponse {
  success: boolean;
  data: OnboardingStatus;
  error?: string;
}

// User Tracks
export interface UserTracks {
  tracks: string[]; // Array of track IDs
  count: number;
}

export interface UserTracksApiResponse {
  success: boolean;
  data: UserTracks;
  error?: string;
}

// User Licensed Tracks (for library)
export interface UserLicensedTrack {
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

export interface UserLicensedTracksApiResponse {
  success: boolean;
  data: UserLicensedTrack[];
  error?: string;
}

// Creator Earnings Summary
export interface CreatorEarningsSummary {
  totalRevenue: number;
  totalLicensesSold: number;
  totalClaimed: number;
  pendingRevenue: number;
  trackCount: number;
}

export interface CreatorEarningsApiResponse {
  success: boolean;
  data: CreatorEarningsSummary;
  error?: string;
}

// Follow System (if implemented)
export interface FollowRequest {
  follower_address: string;
  following_address: string;
}

export interface UnfollowRequest {
  follower_address: string;
  following_address: string;
}

export interface FollowApiResponse {
  success: boolean;
  data: {
    id: string;
    follower_address: string;
    following_address: string;
    created_at: string;
  };
  error?: string;
}

// User Stats
export interface UserStats {
  totalTracks: number;
  totalPlays: number;
  totalLikes: number;
  totalRevenue: number;
  totalLicensesSold: number;
  followersCount: number;
  followingCount: number;
}

// User Activity (if implemented)
export interface UserActivity {
  id: string;
  user_address: string;
  activity_type: "track_upload" | "license_purchase" | "follow" | "like";
  target_id: string; // Track ID, User address, etc.
  metadata?: Record<string, any>;
  created_at: string;
}

export interface UserActivityApiResponse {
  success: boolean;
  data: UserActivity[];
  error?: string;
}

// User Preferences (if implemented)
export interface UserPreferences {
  notifications: {
    email: boolean;
    push: boolean;
    newFollowers: boolean;
    licensePurchases: boolean;
    royaltyPayments: boolean;
  };
  privacy: {
    profilePublic: boolean;
    tracksPublic: boolean;
    earningsPublic: boolean;
  };
  display: {
    theme: "light" | "dark" | "system";
    language: string;
  };
}

// Social Links (if implemented)
export interface SocialLink {
  platform: string; // "twitter", "instagram", "youtube", etc.
  url: string;
  verified: boolean;
}

// Extended User Profile (with all optional fields)
export interface ExtendedUserProfile extends UserProfile {
  bio?: string;
  location?: string;
  website?: string;
  socialLinks?: SocialLink[];
  preferences?: UserPreferences;
  stats?: UserStats;
}
