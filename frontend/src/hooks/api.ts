// Story Protocol API types (organized by domain)
import type { RegistrationRequest, RegistrationResponse } from "@/types/registration";
import type {
  ImageUploadRequest,
  ImageUploadResponse,
  MediaUploadRequest,
  MediaUploadResponse,
} from "@/types/upload";
import type { VerificationRequest, VerificationResponse } from "@/types/verification";

// Track type from correct location
import type { Track } from "@/types/track";

// API Response types - moved from api.ts since they're only used here
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface User {
  address: string;
  username?: string;
  displayName: string;
  trackCount: number;
  followingCount: number;
  followersCount: number;
  verified: boolean;
  avatar_url?: string;
  joinedAt: string;
  tracks: string[];
}

interface TracksResponse {
  tracks: Track[];
  total: number;
  hasMore: boolean;
}

interface UserTracksResponse {
  tracks: string[];
  count: number;
}

// React Query and API client
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../lib/api/client";

// Track hooks - Story Protocol format
interface TracksParams {
  tab?: "latest" | "following" | "trending";
  user_address?: string;
  genre?: string;
  limit?: number;
  offset?: number;
}

export function useTracks(params: TracksParams = {}) {
  return useQuery({
    queryKey: ["tracks", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.tab) searchParams.append("tab", params.tab);
      if (params.user_address) searchParams.append("user_address", params.user_address);
      if (params.genre) searchParams.append("genre", params.genre);
      if (params.limit) searchParams.append("limit", params.limit.toString());
      if (params.offset) searchParams.append("offset", params.offset.toString());

      const response = await apiClient.get<ApiResponse<TracksResponse>>(
        `/tracks?${searchParams.toString()}`,
      );
      return response;
    },
  });
}

export function useTrack(id: string) {
  return useQuery({
    queryKey: ["track", id],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Track>>(`/tracks/${id}`);
      return response;
    },
    enabled: !!id,
  });
}

export function useTrendingTracks() {
  return useQuery({
    queryKey: ["tracks", "trending", "sidebar"],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Track[]>>("/tracks/trending/sidebar");
      return response;
    },
  });
}

// User hooks
export function useUser(identifier: string) {
  return useQuery({
    queryKey: ["user", identifier],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<User>>(`/users/${identifier}`);
      return response;
    },
    enabled: !!identifier,
  });
}

export function useUserTracks(address: string) {
  return useQuery({
    queryKey: ["user", address, "tracks"],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<UserTracksResponse>>(
        `/users/${address}/tracks`,
      );
      return response;
    },
    enabled: !!address,
  });
}

// Upload hooks - Story Protocol naming
export function useUploadMedia() {
  return useMutation({
    mutationFn: async (data: MediaUploadRequest) => {
      const response = await apiClient.post<MediaUploadResponse>("/upload/audio", data);
      return response;
    },
  });
}

export function useUploadMetadata() {
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.post<ApiResponse<any>>("/upload/metadata", data);
      return response;
    },
  });
}

export function useUploadAvatar() {
  return useMutation({
    mutationFn: async (data: MediaUploadRequest) => {
      const response = await apiClient.post<ApiResponse<any>>("/upload/avatar", data);
      return response;
    },
  });
}

export function useUploadImage() {
  return useMutation({
    mutationFn: async (data: ImageUploadRequest) => {
      const response = await apiClient.post<ImageUploadResponse>("/upload/cover-art", data);
      return response;
    },
  });
}

// Registration hooks - Story Protocol
export function useRegisterTrack() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: RegistrationRequest) => {
      const response = await apiClient.post<ApiResponse<RegistrationResponse>>(
        "/registration/register",
        data,
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tracks"] });
    },
  });
}

// Verification hooks - Yakoa integration
export function useVerifyTrack() {
  return useMutation({
    mutationFn: async (data: VerificationRequest) => {
      const response = await apiClient.post<ApiResponse<VerificationResponse>>(
        "/verification/verify-music",
        data,
      );
      return response;
    },
  });
}

export function useVerificationStatus(tokenId: string) {
  return useQuery({
    queryKey: ["verification-status", tokenId],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<VerificationResponse>>(
        `/verification/status/${tokenId}`,
      );
      return response;
    },
    enabled: !!tokenId,
    refetchInterval: 2000, // Poll every 2 seconds
    staleTime: 0, // Always refetch
  });
}

// License hooks
export function useMintLicense() {
  return useMutation({
    mutationFn: async (data: { ipId: string; amount: number; receiver: string }) => {
      const response = await apiClient.post<ApiResponse<any>>("/licenses/mint", data);
      return response;
    },
  });
}

export function useUserLicensedTracks(userAddress: string) {
  return useQuery({
    queryKey: ["user-licensed-tracks", userAddress],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<any[]>>(
        `/users/${userAddress}/licensed-tracks`,
      );
      return response;
    },
    enabled: !!userAddress,
  });
}

// Royalty hooks
export function usePayRoyalty() {
  return useMutation({
    mutationFn: async (data: {
      ipId: string;
      amount: string;
      token: string;
      payer: string;
    }) => {
      const response = await apiClient.post<ApiResponse<any>>("/royalty/pay", data);
      return response;
    },
  });
}

export function useClaimRoyalty() {
  return useMutation({
    mutationFn: async (data: {
      ancestorIpId: string;
      claimer: string;
    }) => {
      const response = await apiClient.post<ApiResponse<any>>("/royalty/claim", data);
      return response;
    },
  });
}

// User profile hooks
export function useCreateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      address: string;
      display_name: string;
      avatar_url?: string;
    }) => {
      const response = await apiClient.post<ApiResponse<any>>("/users/create-profile", data);
      return response;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["user", variables.address] });
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      address,
      ...data
    }: {
      address: string;
      display_name: string;
      username?: string;
      avatar_url?: string;
    }) => {
      const response = await apiClient.put<ApiResponse<any>>(`/users/${address}`, data);
      return response;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["user", variables.address] });
    },
  });
}

export function useCheckUsername(username: string) {
  return useQuery({
    queryKey: ["check-username", username],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<{ available: boolean; reason?: string }>>(
        `/users/check-username/${username}`,
      );
      return response;
    },
    enabled: !!username && username.length >= 3,
  });
}

export function useOnboardingStatus(address: string) {
  return useQuery({
    queryKey: ["onboarding-status", address],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<{ hasProfile: boolean }>>(
        `/users/${address}/onboarding-status`,
      );
      return response;
    },
    enabled: !!address,
  });
}

export function useUserEarnings(address: string) {
  return useQuery({
    queryKey: ["user-earnings", address],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<any>>(`/users/${address}/earnings`);
      return response;
    },
    enabled: !!address,
  });
}

// Additional hooks for track creation and authorization
export function useCreateTrack() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      title: string;
      description: string;
      genre: string;
      tags: string[];
      creators: Array<{
        name: string;
        address: string;
        contributionPercent: number;
      }>;
      image: string;
      imageHash: string;
      mediaUrl: string;
      mediaHash: string;
      mediaType: string;
    }) => {
      const response = await apiClient.post<ApiResponse<Track>>("/tracks", data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tracks"] });
    },
  });
}

export function useAuthorizeContent() {
  return useMutation({
    mutationFn: async (data: {
      tokenId: string;
      brandId?: string;
      brandName?: string;
      authorizationType: string;
      authorizationData: Record<string, any>;
    }) => {
      const response = await apiClient.post<ApiResponse<any>>("/verification/authorize", data);
      return response;
    },
  });
}

// Derivative hooks
export function useRegisterDerivative() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      parentIpId: string;
      licenseTermsId: string;
      metadata: any;
      nftMetadata: any;
    }) => {
      const response = await apiClient.post<ApiResponse<any>>("/derivative/register", data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tracks"] });
    },
  });
}

export function useDerivativeChildren(parentIpId: string) {
  return useQuery({
    queryKey: ["derivative", "children", parentIpId],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<any[]>>(
        `/derivative/children/${parentIpId}`,
      );
      return response;
    },
    enabled: !!parentIpId,
  });
}

export function useDerivativeParents(derivativeIpId: string) {
  return useQuery({
    queryKey: ["derivative", "parents", derivativeIpId],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<any[]>>(
        `/derivative/parents/${derivativeIpId}`,
      );
      return response;
    },
    enabled: !!derivativeIpId,
  });
}

export function useCanRemix(parentIpId: string) {
  return useQuery({
    queryKey: ["can-remix", parentIpId],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<{ canRemix: boolean; reason?: string }>>(
        `/derivative/can-remix/${parentIpId}`,
      );
      return response;
    },
    enabled: !!parentIpId,
  });
}
