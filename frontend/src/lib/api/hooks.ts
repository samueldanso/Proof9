import type { Track } from "@/types/track";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient } from "./client";
import type {
  RegistrationRequest,
  RegistrationResponse,
  VerificationRequest,
  VerificationResponse,
} from "./types";

// Track hooks
export function useTracks(tab = "following") {
  return useQuery({
    queryKey: ["tracks", tab],
    queryFn: () =>
      apiClient.get<{
        tracks: Track[];
        total: number;
        hasMore: boolean;
      }>(`/api/tracks?tab=${tab}`),
  });
}

export function useTrack(trackId: string) {
  return useQuery({
    queryKey: ["track", trackId],
    queryFn: () => apiClient.get<Track>(`/api/tracks/${trackId}`),
    enabled: !!trackId,
  });
}

export function useTrendingTracks() {
  return useQuery({
    queryKey: ["tracks", "trending", "sidebar"],
    queryFn: () => apiClient.get<Track[]>("/api/tracks/trending/sidebar"),
  });
}

// User hooks
export function useUser(address: string) {
  return useQuery({
    queryKey: ["user", address],
    queryFn: () =>
      apiClient.get<{
        address: string;
        displayName: string;
        trackCount: number;
        followingCount: number;
        followersCount: number;
        verified: boolean;
      }>(`/api/users/${address}`),
    enabled: !!address,
  });
}

export function useUserTracks(address: string) {
  return useQuery({
    queryKey: ["user", address, "tracks"],
    queryFn: () =>
      apiClient.get<{
        tracks: string[];
        count: number;
      }>(`/api/users/${address}/tracks`),
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
    }) => apiClient.post("/api/upload/audio", data),
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
    }) => apiClient.post("/api/upload/metadata", data),
  });
}

// Registration hooks
export function useRegisterTrack() {
  return useMutation({
    mutationFn: (data: RegistrationRequest) =>
      apiClient.post<RegistrationResponse>("/api/registration/register", data),
    onSuccess: (response) => {
      console.log("Track registered:", response.data);
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
      apiClient.post<VerificationResponse>("/api/verification/verify-music", data),
    onSuccess: (response) => {
      console.log("Track verified:", response.data);
    },
    onError: (error) => {
      console.error("Verification failed:", error);
    },
  });
}

export function useVerificationStatus(tokenId: string) {
  return useQuery({
    queryKey: ["verification", tokenId],
    queryFn: () => apiClient.get<VerificationResponse>(`/api/verification/status/${tokenId}`),
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
    }) => apiClient.post("/api/licenses/mint", data),
  });
}

// Social features hooks
export function useLikeTrack() {
  return useMutation({
    mutationFn: (data: { userAddress: string; trackId: string }) =>
      apiClient.post("/api/social/like", data),
  });
}

export function useAddComment() {
  return useMutation({
    mutationFn: (data: {
      userAddress: string;
      trackId: string;
      content: string;
    }) => apiClient.post("/api/social/comment", data),
  });
}

export function useTrackComments(trackId: string) {
  return useQuery({
    queryKey: ["comments", trackId],
    queryFn: () => apiClient.get(`/api/social/comments/${trackId}`),
    enabled: !!trackId,
  });
}

export function useUserLikes(userAddress: string) {
  return useQuery({
    queryKey: ["user", userAddress, "likes"],
    queryFn: () => apiClient.get(`/api/social/user/${userAddress}/likes`),
    enabled: !!userAddress,
  });
}
