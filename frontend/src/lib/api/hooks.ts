import type { Track } from "@/types/track";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient } from "./client";
import type {
  RegistrationRequest,
  RegistrationResponse,
  VerificationRequest,
  VerificationResponse,
} from "./types";

// Backend API Response wrapper type
interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  error?: string;
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
          tracks: Track[];
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
    queryFn: () => apiClient.get<ApiResponse<Track>>(`/api/tracks/${trackId}`),
    enabled: !!trackId,
  });
}

export function useTrendingTracks() {
  return useQuery({
    queryKey: ["tracks", "trending", "sidebar"],
    queryFn: () => apiClient.get<ApiResponse<Track[]>>("/api/tracks/trending/sidebar"),
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

// Social features hooks
export function useLikeTrack() {
  return useMutation({
    mutationFn: (data: { userAddress: string; trackId: string }) =>
      apiClient.post<ApiResponse<any>>("/api/social/like", data),
  });
}

export function useAddComment() {
  return useMutation({
    mutationFn: (data: {
      userAddress: string;
      trackId: string;
      content: string;
    }) => apiClient.post<ApiResponse<any>>("/api/social/comment", data),
  });
}

export function useTrackComments(trackId: string) {
  return useQuery({
    queryKey: ["comments", trackId],
    queryFn: () => apiClient.get<ApiResponse<any>>(`/api/social/comments/${trackId}`),
    enabled: !!trackId,
  });
}

export function useUserLikes(userAddress: string) {
  return useQuery({
    queryKey: ["user", userAddress, "likes"],
    queryFn: () => apiClient.get<ApiResponse<any>>(`/api/social/user/${userAddress}/likes`),
    enabled: !!userAddress,
  });
}

// Search hooks
export function useSearchUsers(query: string) {
  return useQuery({
    queryKey: ["search", "users", query],
    queryFn: async () => {
      if (!query.trim()) return [];
      // Use direct Supabase query for search since we don't have backend endpoint yet
      const { profileQueries } = await import("@/lib/db/queries");
      return profileQueries.search(query, 10);
    },
    enabled: !!query.trim(),
    staleTime: 30000, // Cache for 30 seconds
  });
}
