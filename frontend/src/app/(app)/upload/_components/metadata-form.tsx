"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUploadImage, useUser } from "@/hooks/api";
import { ImageIcon, Plus, Upload, X } from "lucide-react";
import { AlertTriangle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useAccount } from "wagmi";

// Story Protocol compliant metadata interface - EXACT NAMING ONLY
interface MetadataFormData {
  // === Story Protocol IPA Standard ===
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

  // Story Protocol image.* fields
  image?: string;
  imageHash?: string;

  // Story Protocol media.* fields
  mediaUrl?: string;
  mediaHash?: string;
  mediaType?: string;

  // === Additional Metadata ===
  genre: string;
  tags: string[];
  duration?: string;

  // === NFT Metadata (ERC-721 Standard) ===
  nftName?: string;
  nftDescription?: string;
  attributes?: Array<{
    key: string;
    value: string;
  }>;
}

interface MetadataFormProps {
  initialData?: MetadataFormData;
  mediaFile?: File;
  imageFile?: File;
  mediaResult?: {
    mediaUrl: string;
    mediaHash: string;
    mediaType: string;
  };
  imageResult?: {
    image: string;
    imageHash: string;
  };
  onSubmit: (metadata: MetadataFormData) => void;
  onNext: () => void;
  onBack: () => void;
}

const GENRES = [
  "Electronic",
  "Hip Hop",
  "Pop",
  "Rock",
  "Jazz",
  "Classical",
  "R&B",
  "Country",
  "Folk",
  "Blues",
  "Reggae",
  "Punk",
  "Metal",
  "Alternative",
  "Indie",
  "World",
  "Other",
];

// Helper function to convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64 = reader.result as string;
      // Remove data:image/xxx;base64, prefix
      const base64Data = base64.split(",")[1];
      resolve(base64Data);
    };
    reader.onerror = (error) => reject(error);
  });
};

// Helper function to extract and clean track title from filename
const extractTitleFromFilename = (filename: string): string => {
  // Remove file extension
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, "");

  // Clean up common patterns
  let cleanTitle = nameWithoutExt
    // Replace underscores and hyphens with spaces
    .replace(/[_-]/g, " ")
    // Handle common separators for features (ft, feat, featuring)
    .replace(/\s+(ft\.?|feat\.?|featuring)\s+/gi, " ft. ")
    // Handle "vs" and "x" collaborations
    .replace(/\s+(vs\.?|versus|x)\s+/gi, " vs. ")
    // Remove extra spaces
    .replace(/\s+/g, " ")
    // Trim spaces
    .trim();

  // Capitalize each word (Title Case)
  cleanTitle = cleanTitle
    .split(" ")
    .map((word) => {
      // Keep common lowercase words like "ft.", "vs.", "the", "and", "or", "of", "in", "on"
      const lowercaseWords = [
        "ft.",
        "vs.",
        "the",
        "and",
        "or",
        "of",
        "in",
        "on",
        "at",
        "to",
        "for",
        "with",
      ];
      if (lowercaseWords.includes(word.toLowerCase())) {
        return word.toLowerCase();
      }
      // Capitalize first letter of other words
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");

  // Ensure first word is always capitalized
  if (cleanTitle.length > 0) {
    cleanTitle = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);
  }

  return cleanTitle;
};

export default function MetadataForm({
  initialData,
  mediaFile,
  imageFile,
  mediaResult,
  imageResult,
  onSubmit,
  onNext,
  onBack,
}: MetadataFormProps) {
  const { address } = useAccount();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadImageMutation = useUploadImage();

  // Fetch user profile to auto-populate creator name
  const { data: userResponse } = useUser(address || "");
  const userData = userResponse?.data;

  const [formData, setFormData] = useState<MetadataFormData>({
    // Auto-populate title from audio filename if not provided
    title: initialData?.title || (mediaFile ? extractTitleFromFilename(mediaFile.name) : ""),
    description: initialData?.description || "",
    genre: initialData?.genre || "",
    tags: initialData?.tags || [],
    // Auto-fill creator info from wallet and profile
    creators: initialData?.creators || [
      {
        name: userData?.displayName || "",
        address: address || "",
        contributionPercent: 100,
      },
    ],
    // Story Protocol fields from upload results
    image: initialData?.image || imageResult?.image,
    imageHash: initialData?.imageHash || imageResult?.imageHash,
    mediaUrl: initialData?.mediaUrl || mediaResult?.mediaUrl,
    mediaHash: initialData?.mediaHash || mediaResult?.mediaHash,
    mediaType: initialData?.mediaType || mediaResult?.mediaType || mediaFile?.type || "",
    // NFT metadata
    nftName: initialData?.nftName,
    nftDescription: initialData?.nftDescription,
    attributes: initialData?.attributes || [],
  });

  // Auto-populate creator name when user data loads
  useEffect(() => {
    if (userData?.displayName && !initialData?.creators) {
      setFormData((prev) => ({
        ...prev,
        creators: [
          {
            name: userData.displayName,
            address: address || "",
            contributionPercent: 100,
          },
        ],
      }));
    }
  }, [userData?.displayName, address, initialData?.creators]);

  // Auto-populate title from filename when media file becomes available
  useEffect(() => {
    if (mediaFile && !initialData?.title && !formData.title) {
      const autoTitle = extractTitleFromFilename(mediaFile.name);
      setFormData((prev) => ({
        ...prev,
        title: autoTitle,
      }));
    }
  }, [mediaFile?.name, initialData?.title, formData.title]);

  // Tag management
  const [currentTag, setCurrentTag] = useState("");

  const handleAddTag = () => {
    const tag = currentTag.trim();
    if (tag && !formData.tags.includes(tag) && formData.tags.length < 10) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tag],
      }));
      setCurrentTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Basic fields
    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }
    if (!formData.genre) {
      newErrors.genre = "Genre is required";
    }

    // Story Protocol required fields
    if (formData.creators.length === 0 || !formData.creators[0]?.name.trim()) {
      newErrors.creators = "Creator name is required";
    }
    if (
      formData.creators.length > 0 &&
      (!formData.creators[0]?.address || !formData.creators[0]?.contributionPercent)
    ) {
      newErrors.creators = "Creator address and contribution percent are required";
    }

    // Check Story Protocol media fields
    if (!formData.image && !imageResult?.image) {
      newErrors.coverArt = "Cover art is required - please go back and upload an image";
    }
    if (!formData.mediaUrl && !mediaResult?.mediaUrl) {
      newErrors.media = "Audio file is required - please go back and upload audio";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      // Use Story Protocol naming from upload results
      const finalData = {
        ...formData,
        image: formData.image || imageResult?.image,
        imageHash: formData.imageHash || imageResult?.imageHash,
        mediaUrl: formData.mediaUrl || mediaResult?.mediaUrl,
        mediaHash: formData.mediaHash || mediaResult?.mediaHash,
        mediaType: formData.mediaType || mediaResult?.mediaType || mediaFile?.type,
      };

      onSubmit(finalData);
    }
  };

  const handleCoverArtSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image size must be less than 10MB");
      return;
    }

    // Create preview
    const previewUrl = URL.createObjectURL(file);
    setCoverPreview(previewUrl);

    // Update form data
    setFormData((prev) => ({
      ...prev,
      coverArt: file,
    }));

    toast.success("Cover art selected");
  };

  // Form validation
  const isFormValid = () => {
    return (
      formData.title.trim() &&
      formData.description.trim() &&
      formData.genre &&
      formData.creators[0]?.name.trim() &&
      formData.creators[0]?.address &&
      (formData.image || imageResult?.image) && // Story Protocol image field
      (formData.mediaUrl || mediaResult?.mediaUrl) // Story Protocol mediaUrl field
    );
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="font-bold text-2xl">Track Details</h2>
        <p className="text-muted-foreground">
          Add information about your track for Story Protocol registration
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Media Preview from Upload Step */}
        {(mediaFile || imageFile) && (
          <div className="rounded-lg border bg-gradient-to-br from-[#ced925]/5 to-[#ced925]/10 p-6">
            <h3 className="mb-4 font-semibold">📁 Uploaded Files</h3>

            <div className="flex items-start space-x-4">
              {/* Cover Art Preview - Story Protocol image field */}
              <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                {imageResult?.image ? (
                  <img
                    src={imageResult.image}
                    alt="Cover preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Media Info - Story Protocol mediaUrl field */}
              <div className="flex-1 space-y-2">
                <div>
                  <h4 className="font-medium">{mediaFile?.name || "Audio File"}</h4>
                  <p className="text-muted-foreground text-sm">
                    {mediaFile && `${(mediaFile.size / (1024 * 1024)).toFixed(2)} MB`} •{" "}
                    {mediaResult?.mediaType || mediaFile?.type}
                  </p>
                </div>

                <div className="text-muted-foreground text-xs">
                  ✓ Media URL: {mediaResult?.mediaUrl ? "Ready" : "Missing"}
                  <br />✓ Image URL: {imageResult?.image ? "Ready" : "Missing"}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Basic Track Information */}
        <div className="space-y-6">
          <div className="border-b pb-2">
            <h3 className="font-semibold text-lg">Basic Information</h3>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Track Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Enter your track title"
                className={errors.title ? "border-red-500" : ""}
              />

              {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
            </div>

            {/* Genre */}
            <div className="space-y-2">
              <Label htmlFor="genre">Genre *</Label>
              <select
                id="genre"
                value={formData.genre}
                onChange={(e) => setFormData((prev) => ({ ...prev, genre: e.target.value }))}
                className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:font-medium file:text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                  errors.genre ? "border-red-500" : ""
                }`}
              >
                <option value="">Select a genre</option>
                {GENRES.map((genre) => (
                  <option key={genre} value={genre}>
                    {genre}
                  </option>
                ))}
              </select>
              {errors.genre && <p className="text-red-500 text-sm">{errors.genre}</p>}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your track..."
              rows={3}
              className={errors.description ? "border-red-500" : ""}
            />
            {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
          </div>
        </div>

        {/* Story Protocol Creator Information */}
        <div className="space-y-6">
          <div className="border-b pb-2">
            <h3 className="font-semibold text-lg">Creator Information</h3>
            <p className="text-muted-foreground text-sm">
              Required for Story Protocol IP registration
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Creator Name */}
            <div className="space-y-2">
              <Label htmlFor="creatorName">Creator Name *</Label>
              <Input
                id="creatorName"
                value={formData.creators[0]?.name || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    creators: [
                      {
                        ...prev.creators[0],
                        name: e.target.value,
                      },
                    ],
                  }))
                }
                placeholder="Your artist/creator name"
                className={errors.creators ? "border-red-500" : ""}
              />
              {errors.creators && <p className="text-red-500 text-sm">{errors.creators}</p>}
            </div>

            {/* Creator Address */}
            <div className="space-y-2">
              <Label htmlFor="creatorAddress">Creator Address *</Label>
              <Input
                id="creatorAddress"
                value={formData.creators[0]?.address || ""}
                readOnly
                className="bg-muted"
                placeholder="Connected wallet address"
              />
              <p className="text-muted-foreground text-xs">
                This is automatically filled from your connected wallet
              </p>
            </div>
          </div>

          {/* Contribution Percentage */}
          <div className="space-y-2">
            <Label htmlFor="contribution">Contribution Percentage *</Label>
            <Input
              id="contribution"
              type="number"
              min="1"
              max="100"
              value={formData.creators[0]?.contributionPercent || 100}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  creators: [
                    {
                      ...prev.creators[0],
                      contributionPercent: Number.parseInt(e.target.value) || 100,
                    },
                  ],
                }))
              }
              className="max-w-32"
            />
            <p className="text-muted-foreground text-sm">
              Percentage of creative contribution (default: 100% for solo creators)
            </p>
          </div>
        </div>

        {/* Tags & Additional Info */}
        <div className="space-y-6">
          <div className="border-b pb-2">
            <h3 className="font-semibold text-lg">Tags & Additional Info</h3>
            <p className="text-muted-foreground text-sm">Help others discover your track</p>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Add a tag (e.g., chill, electronic, remix)"
                  className="flex-1"
                />
                <Button type="button" onClick={handleAddTag} variant="outline" size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Display Tags */}
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <p className="text-muted-foreground text-sm">
              Add relevant tags to help people discover your track
            </p>
          </div>
        </div>

        {/* Story Protocol Technical Information - Read Only Preview */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Story Protocol Technical Information</h3>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Media Type */}
            <div className="space-y-2">
              <Label>Media Type</Label>
              <Input
                value={formData.mediaType || "Not detected"}
                readOnly
                className="bg-muted"
                placeholder="Auto-detected from uploaded file"
              />
            </div>

            {/* Content Verification */}
            <div className="space-y-2">
              <Label>Content Verification</Label>
              <Input
                value={formData.mediaHash ? "✓ Ready for Story Protocol" : "⚠ Missing hash"}
                readOnly
                className="bg-muted"
              />
            </div>
          </div>
        </div>

        {/* Story Protocol Registration Preview */}
        <div className="rounded-lg border bg-gradient-to-br from-[#ced925]/5 to-[#ced925]/10 p-6">
          <h3 className="mb-4 font-semibold text-lg">📜 Story Protocol Registration Preview</h3>

          <div className="flex items-start space-x-4">
            {/* Cover Art Preview - Story Protocol image field */}
            <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
              {formData.image || imageResult?.image ? (
                <img
                  src={formData.image || imageResult?.image}
                  alt="Cover preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Track Info */}
            <div className="flex-1 space-y-2">
              <div>
                <h4 className="font-semibold text-lg">{formData.title || "Track Title"}</h4>
                <p className="text-muted-foreground">
                  Creator: {formData.creators[0]?.name || "Creator Name"}
                </p>
              </div>

              <div className="flex items-center space-x-4 text-sm">
                <span className="rounded-full bg-[#ced925]/20 px-2 py-1 text-[#ced925]">
                  {formData.genre || "Genre"}
                </span>
                <span className="text-muted-foreground">
                  Media Type: {formData.mediaType || "audio/mpeg"}
                </span>
              </div>

              {formData.description && (
                <p className="line-clamp-2 text-muted-foreground text-sm">{formData.description}</p>
              )}

              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {formData.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {formData.tags.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{formData.tags.length - 3} more
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Validation Errors */}
        {(errors.coverArt || errors.media) && (
          <div className="rounded-lg border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/20">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <h4 className="font-medium text-red-800 dark:text-red-200">Missing Upload Data</h4>
                {errors.coverArt && (
                  <p className="text-red-700 text-sm dark:text-red-300">{errors.coverArt}</p>
                )}
                {errors.media && (
                  <p className="text-red-700 text-sm dark:text-red-300">{errors.media}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between border-t pt-6">
          <Button type="button" variant="outline" onClick={onBack}>
            ← Back to Upload
          </Button>

          <Button
            type="submit"
            disabled={!isFormValid()}
            className="bg-[#ced925] text-black hover:bg-[#b8c220] disabled:opacity-50"
          >
            Verify Sound →
          </Button>
        </div>
      </form>
    </div>
  );
}
