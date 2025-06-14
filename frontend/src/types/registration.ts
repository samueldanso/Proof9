// Story Protocol registration types
// Maps to backend /api/registration/* routes

import type { StoryIPMetadata, StoryNFTMetadata } from "./upload";

// Story Protocol Creator interface (exact from docs)
export interface StoryCreator {
  name: string;
  address: string;
  contributionPercent: number;
  description?: string;
  socialMedia?: Array<{
    platform: string;
    url: string;
  }>;
}

// Commercial Remix Terms (Story Protocol PIL)
export interface CommercialRemixTerms {
  defaultMintingFee: number;
  commercialRevShare: number; // 0-100 percentage
}

// Registration Request (Story Protocol compliant)
export interface RegistrationRequest {
  // IP Metadata (Story Protocol IPA Standard)
  title: string;
  description: string;
  creators: StoryCreator[];

  // Story Protocol image.* fields
  image: string;
  imageHash: string;

  // Story Protocol media.* fields
  mediaUrl: string;
  mediaHash: string;
  mediaType: string;

  // NFT Metadata (ERC-721 Standard)
  nftName?: string;
  nftDescription?: string;
  attributes?: Array<{
    key: string;
    value: string;
  }>;

  // License Terms
  commercialRemixTerms?: CommercialRemixTerms;
}

// Registration Response (Story Protocol SDK response)
export interface RegistrationResponse {
  transactionHash: string;
  ipId: string; // Story Protocol IP Asset ID
  tokenId?: string;
  licenseTermsIds: string[];
  explorerUrl: string;
  ipMetadata: StoryIPMetadata;
  nftMetadata: StoryNFTMetadata;
}

// API Response wrapper
export interface RegistrationApiResponse {
  success: boolean;
  data: RegistrationResponse;
  error?: string;
}

// License Terms Data (Story Protocol PIL)
export interface LicenseTermsData {
  terms: {
    transferable: boolean;
    royaltyPolicy: string;
    defaultMintingFee: string;
    expiration: string;
    commercialUse: boolean;
    commercialAttribution: boolean;
    commercializerChecker: string;
    commercializerCheckerData: string;
    commercialRevShare: number;
    commercialRevCeiling: string;
    derivativesAllowed: boolean;
    derivativesAttribution: boolean;
    derivativesApproval: boolean;
    derivativesReciprocal: boolean;
    derivativeRevCeiling: string;
    currency: string;
    uri: string;
  };
}

// Story Protocol IP Asset Metadata for registration
export interface IPAssetMetadata {
  ipMetadataURI: string;
  ipMetadataHash: string;
  nftMetadataURI: string;
  nftMetadataHash: string;
}

// Complete registration payload
export interface MintAndRegisterRequest {
  spgNftContract: string;
  licenseTermsData: LicenseTermsData[];
  ipMetadata: IPAssetMetadata;
  txOptions?: {
    waitForTransaction: boolean;
  };
}
