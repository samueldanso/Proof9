import type { Track } from "@/types/track";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient } from "../../lib/api/client";
import type {
  RegistrationRequest,
  RegistrationResponse,
  VerificationRequest,
  VerificationResponse,
} from "../../lib/api/types";

// Backend API Response wrapper type
interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  error?: string;
}

// API Track type (includes fields from backend that aren't in the legacy Track type)
interface ApiTrack extends Track {
  artistUsername?: string;
}

// Track hooks
export function useTracks(tab = "latest", userAddress?: string, genre?: string) {
  return useQuery({
    queryKey: ["tracks", tab, userAddress, genre],
    queryFn: () => {
      const params = new URLSearchParams({ tab });
      if (userAddress && tab === "following") {
        params.append("user_address", userAddress);
      }
      if (genre) {
        params.append("genre", genre);
      }
      return apiClient.get<
        ApiResponse<{
          tracks: ApiTrack[];
          total: number;
          hasMore: boolean;
        }>
      >(`/api/tracks?${params.toString()}`);
    },
  });
}

export function useTrack(trackId: string) {
  return useQuery({
    queryKey: ["track", trackId],
    queryFn: () => apiClient.get<ApiResponse<ApiTrack>>(`/api/tracks/${trackId}`),
    enabled: !!trackId,
  });
}

export function useTrendingTracks() {
  return useQuery({
    queryKey: ["tracks", "trending", "sidebar"],
    queryFn: () => apiClient.get<ApiResponse<ApiTrack[]>>("/api/tracks/trending/sidebar"),
  });
}

// User hooks
export function useUser(identifier: string) {
  return useQuery({
    queryKey: ["user", identifier],
    queryFn: () =>
      apiClient.get<
        ApiResponse<{
          address: string;
          username?: string | null;
          displayName: string;
          trackCount: number;
          followingCount: number;
          followersCount: number;
          verified: boolean;
          avatar_url?: string | null;
        }>
      >(`/api/users/${identifier}`),
    enabled: !!identifier,
  });
}

export function useUserTracks(address: string) {
  return useQuery({
    queryKey: ["user", address, "tracks"],
    queryFn: () =>
      apiClient.get<
        ApiResponse<{
          tracks: string[];
          count: number;
        }>
      >(`/api/users/${address}/tracks`),
    enabled: !!address,
  });
}

// Upload hooks
export function useUploadAudio() {
  return useMutation({
    mutationFn: (data: {
      fileName: string;
      fileType: string;
      fileSize: number;
      fileData: string;
    }) =>
      apiClient.post<
        ApiResponse<{
          fileName: string;
          fileType: string;
          fileSize: number;
          fileHash: string;
          ipfsHash: string;
          ipfsUrl: string;
          uploadedAt: string;
        }>
      >("/api/upload/audio", data),
  });
}

export function useUploadMetadata() {
  return useMutation({
    mutationFn: (data: {
      title: string;
      description: string;
      genre: string;
      tags: string[];
      duration?: string;
    }) => apiClient.post<ApiResponse<any>>("/api/upload/metadata", data),
  });
}

export function useUploadAvatar() {
  return useMutation({
    mutationFn: (data: {
      fileName: string;
      fileType: string;
      fileSize: number;
      fileData: string;
    }) =>
      apiClient.post<
        ApiResponse<{
          fileName: string;
          fileType: string;
          fileSize: number;
          fileHash: string;
          ipfsHash: string;
          avatarUrl: string;
          uploadedAt: string;
        }>
      >("/api/upload/avatar", data),
  });
}

export function useUploadCoverArt() {
  return useMutation({
    mutationFn: (data: {
      fileName: string;
      fileType: string;
      fileSize: number;
      fileData: string;
    }) =>
      apiClient.post<
        ApiResponse<{
          fileName: string;
          fileType: string;
          fileSize: number;
          fileHash: string;
          ipfsHash: string;
          ipfsUrl: string;
          uploadedAt: string;
        }>
      >("/api/upload/cover-art", data),
  });
}

// Registration hooks
export function useRegisterTrack() {
  return useMutation({
    mutationFn: (data: RegistrationRequest) =>
      apiClient.post<ApiResponse<RegistrationResponse>>("/api/registration/register", data),
    onSuccess: (response) => {
      console.log("Track registered:", response);
    },
    onError: (error) => {
      console.error("Registration failed:", error);
    },
  });
}

// Verification hooks
export function useVerifyTrack() {
  return useMutation({
    mutationFn: (data: VerificationRequest) =>
      apiClient.post<ApiResponse<VerificationResponse>>("/api/verification/verify-music", data),
    onSuccess: (response) => {
      console.log("Track verification initiated:", response);
    },
    onError: (error) => {
      console.error("Verification failed:", error);
    },
  });
}

export function useVerificationStatus(tokenId: string) {
  return useQuery({
    queryKey: ["verification", tokenId],
    queryFn: () =>
      apiClient.get<ApiResponse<VerificationResponse>>(`/api/verification/status/${tokenId}`),
    enabled: !!tokenId,
  });
}

// License hooks
export function useMintLicense() {
  return useMutation({
    mutationFn: (data: {
      licensorIpId: string;
      licenseTermsId: string;
      amount?: number;
    }) => apiClient.post<ApiResponse<any>>("/api/licenses/mint", data),
  });
}

// Licensed tracks hook (for library)
export function useUserLicensedTracks(userAddress: string) {
  return useQuery({
    queryKey: ["user", userAddress, "licensed"],
    queryFn: () => apiClient.get<ApiResponse<any[]>>(`/api/users/${userAddress}/licensed-tracks`),
    enabled: !!userAddress,
  });
}

// ==========================================
// ROYALTY MANAGEMENT HOOKS (CRITICAL)
// ==========================================

export function usePayRoyalty() {
  return useMutation({
    mutationFn: (data: {
      receiverIpId: string;
      payerIpId?: string;
      token?: string;
      amount: number;
      createDerivative?: {
        parentIpId: string;
        licenseTermsId: string;
        metadata?: any;
      };
    }) => apiClient.post<ApiResponse<any>>("/api/royalty/pay", data),
  });
}

export function useClaimRoyalty() {
  return useMutation({
    mutationFn: (data: {
      ancestorIpId: string;
      claimer?: string;
      childIpIds?: string[];
      royaltyPolicies?: string[];
      currencyTokens?: string[];
    }) => apiClient.post<ApiResponse<any>>("/api/royalty/claim", data),
  });
}

// ==========================================
// PROFILE MANAGEMENT HOOKS (CRITICAL)
// ==========================================

export function useCreateProfile() {
  return useMutation({
    mutationFn: (data: {
      address: string;
      display_name: string;
      avatar_url?: string | null;
    }) => apiClient.post<ApiResponse<any>>("/api/users/create-profile", data),
  });
}

export function useUpdateProfile() {
  return useMutation({
    mutationFn: ({
      address,
      ...data
    }: {
      address: string;
      display_name: string;
      username?: string;
      avatar_url?: string | null;
    }) => apiClient.put<ApiResponse<any>>(`/api/users/${address}`, data),
  });
}

export function useCheckUsername(username: string) {
  return useQuery({
    queryKey: ["username-check", username],
    queryFn: () =>
      apiClient.get<ApiResponse<{ available: boolean; reason?: string }>>(
        `/api/users/check-username/${username}`,
      ),
    enabled: !!username && username.length >= 3,
    staleTime: 30000,
  });
}

export function useOnboardingStatus(address: string) {
  return useQuery({
    queryKey: ["onboarding-status", address],
    queryFn: () =>
      apiClient.get<ApiResponse<{ hasProfile: boolean }>>(
        `/api/users/${address}/onboarding-status`,
      ),
    enabled: !!address,
  });
}

export function useUserEarnings(address: string) {
  return useQuery({
    queryKey: ["user", address, "earnings"],
    queryFn: () =>
      apiClient.get<
        ApiResponse<{
          totalRevenue: number;
          totalLicensesSold: number;
          totalClaimed: number;
          pendingRevenue: number;
          trackCount: number;
        }>
      >(`/api/users/${address}/earnings`),
    enabled: !!address,
  });
}

// ==========================================
// TRACK MANAGEMENT HOOKS
// ==========================================

export function useCreateTrack() {
  return useMutation({
    mutationFn: (data: {
      title: string;
      description?: string;
      genre?: string;
      tags?: string[];
      duration?: string;
      artist_address: string;

      // Story Protocol creators array
      creators?: Array<{
        name: string;
        address: string;
        contributionPercent: number;
        description?: string;
        socialMedia?: Array<{
          platform: string;
          url: string;
        }>;
      }>;

      // File and IPFS data
      ipfs_hash?: string;
      ipfs_url?: string;
      file_hash?: string;

      // Story Protocol metadata hashes
      metadata_ipfs_hash?: string;
      metadata_ipfs_url?: string;
      nft_metadata_ipfs_hash?: string;
      nft_metadata_ipfs_url?: string;
      ip_metadata_hash?: string;
      nft_metadata_hash?: string;

      // Media hashes
      image_url?: string;
      image_hash?: string;
      media_hash?: string;

      // Story Protocol data
      ip_id?: string;
      transaction_hash?: string;
      token_id?: string;
      license_terms_ids?: number[];

      // Verification
      verified?: boolean;
      yakoa_token_id?: string;
    }) => apiClient.post<ApiResponse<any>>("/api/tracks", data),
  });
}

// ==========================================
// VERIFICATION HOOKS
// ==========================================

export function useCreateAuthorization() {
  return useMutation({
    mutationFn: (data: {
      tokenId: string;
      brandId?: string;
      brandName?: string;
      authorizationType: string;
      authorizationData: Record<string, any>;
    }) => apiClient.post<ApiResponse<any>>("/api/verification/authorize", data),
  });
}

// ==========================================
// DERIVATIVE HOOKS (REMIX/COVER FUNCTIONALITY)
// ==========================================

export function useRegisterDerivative() {
  return useMutation({
    mutationFn: (data: {
      parentIpId: string;
      licenseTermsId: string;
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
        animation_url?: string;
        attributes?: Array<{
          key: string;
          value: string;
        }>;
      };
    }) => apiClient.post<ApiResponse<any>>("/api/derivative/register", data),
    onSuccess: (response) => {
      console.log("Derivative registered:", response);
    },
    onError: (error) => {
      console.error("Derivative registration failed:", error);
    },
  });
}

export function useGetDerivativeChildren(parentIpId: string) {
  return useQuery({
    queryKey: ["derivative", "children", parentIpId],
    queryFn: () =>
      apiClient.get<ApiResponse<{ parentIpId: string; derivatives: any[] }>>(
        `/api/derivative/children/${parentIpId}`,
      ),
    enabled: !!parentIpId,
  });
}

export function useGetDerivativeParents(derivativeIpId: string) {
  return useQuery({
    queryKey: ["derivative", "parents", derivativeIpId],
    queryFn: () =>
      apiClient.get<ApiResponse<{ derivativeIpId: string; parents: any[] }>>(
        `/api/derivative/parents/${derivativeIpId}`,
      ),
    enabled: !!derivativeIpId,
  });
}

export function useCanRemix(parentIpId: string) {
  return useQuery({
    queryKey: ["derivative", "can-remix", parentIpId],
    queryFn: () =>
      apiClient.get<ApiResponse<{ canRemix: boolean; licenseTerms?: any; requirements?: any }>>(
        `/api/derivative/can-remix/${parentIpId}`,
      ),
    enabled: !!parentIpId,
  });
}
