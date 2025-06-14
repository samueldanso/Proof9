// Maps to backend /api/upload/* routes

// Upload Types

// Media upload result
export interface MediaUploadResult {
  mediaName: string;
  mediaType: string;
  mediaSize: number;
  mediaUrl: string;
  mediaHash: string;
  uploadedAt: string;
}

// Story Protocol image upload result
export interface ImageUploadResult {
  imageName: string;
  imageType: string;
  imageSize: number;
  image: string;
  imageHash: string;
  uploadedAt: string;
}

export interface MediaUploadRequest {
  mediaName: string;
  mediaType: string;
  mediaSize: number;
  mediaData: string;
}

export interface ImageUploadRequest {
  imageName: string;
  imageType: string;
  imageSize: number;
  imageData: string;
}

export interface MediaUploadResponse {
  success: boolean;
  data: {
    mediaName: string;
    mediaType: string;
    mediaSize: number;
    mediaUrl: string;
    mediaHash: string;
    uploadedAt: string;
  };
  error?: string;
}

export interface ImageUploadResponse {
  success: boolean;
  data: {
    imageName: string;
    imageType: string;
    imageSize: number;
    image: string;
    imageHash: string;
    uploadedAt: string;
  };
  error?: string;
}

// Avatar upload response - matches backend /upload/avatar endpoint
export interface AvatarUploadResponse {
  success: boolean;
  data: {
    mediaName: string;
    mediaType: string;
    mediaSize: number;
    avatarUrl: string;
    imageHash: string;
    uploadedAt: string;
  };
  error?: string;
}

// Story Protocol IP Metadata (IPA Standard)
export interface StoryIPMetadata {
  title: string;
  description: string;
  createdAt: string;
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
  // Cover art fields
  image: string;
  imageHash: string;
  // Media fields (checked for infringement)
  mediaUrl: string;
  mediaHash: string;
  mediaType: string;
}

// NFT Metadata (ERC-721 Standard)
export interface StoryNFTMetadata {
  name: string;
  description: string;
  image: string;
  animation_url: string;
  attributes: Array<{
    key: string;
    value: string;
  }>;
}

// Upload flow state management
export interface UploadData {
  // Step 1: File uploads
  mediaFile?: File;
  imageFile?: File;
  mediaResult?: MediaUploadResult;
  imageResult?: ImageUploadResult;

  // Step 2: Metadata collection
  metadata?: {
    title: string;
    description: string;
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
    genre: string;
    tags: string[];
    duration?: string;
  };
}
