"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUploadCoverArt, useUser } from "@/hooks/api";
import { ImageIcon, Plus, Upload, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useAccount } from "wagmi";

// Story Protocol compliant metadata interface
interface MetadataFormData {
  // === IP METADATA (Story Protocol IPA Standard) ===
  // Basic IP info
  title: string;
  description: string;

  // Creator info (Story Protocol creators array)
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

  // Cover art (Story Protocol image.* fields)
  coverArt?: File;
  imageUrl?: string;
  imageHash?: string;

  // Audio file (Story Protocol media.* fields - checked for infringement)
  mediaUrl?: string;
  mediaHash?: string;
  mediaType?: string;

  // === NFT METADATA (ERC-721 Standard) ===
  // NFT display info
  nftName?: string; // Can be different from IP title
  nftDescription?: string; // Can be different from IP description

  // NFT attributes for marketplaces
  attributes?: Array<{
    key: string;
    value: string;
  }>;

  // === ADDITIONAL METADATA (Platform-specific) ===
  genre: string;
  tags: string[];
  duration?: string;
}

interface MetadataFormProps {
  initialData?: MetadataFormData;
  audioFile?: File; // Pass audio file to auto-detect media type
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

export default function MetadataForm({
  initialData,
  audioFile,
  onSubmit,
  onNext,
  onBack,
}: MetadataFormProps) {
  const { address } = useAccount();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadCoverArtMutation = useUploadCoverArt();

  // Fetch user profile to auto-populate creator name
  const { data: userResponse } = useUser(address || "");
  const userData = userResponse?.data;

  const [formData, setFormData] = useState<MetadataFormData>({
    title: initialData?.title || "",
    description: initialData?.description || "",
    genre: initialData?.genre || "",
    tags: initialData?.tags || [],
    // Auto-fill creator info from wallet and profile
    creators: initialData?.creators || [
      {
        name: userData?.displayName || "", // Auto-populate from user profile
        address: address || "",
        contributionPercent: 100,
      },
    ],
    // Cover art
    coverArt: initialData?.coverArt,
    imageUrl: initialData?.imageUrl,
    imageHash: initialData?.imageHash,
    // Auto-detect media type from audio file
    mediaType: initialData?.mediaType || audioFile?.type || "",
    // NFT metadata
    nftName: initialData?.nftName,
    nftDescription: initialData?.nftDescription,
    attributes: initialData?.attributes || [],
    // Audio file
    mediaUrl: initialData?.mediaUrl,
    mediaHash: initialData?.mediaHash,
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
    if (!formData.coverArt && !formData.imageUrl) {
      newErrors.coverArt = "Cover art is required for IP registration";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      // If cover art was uploaded but not processed, process it now
      if (formData.coverArt && !formData.imageUrl) {
        setIsUploadingCover(true);
        try {
          // Convert file to base64
          const fileData = await fileToBase64(formData.coverArt);

          // Upload to IPFS using the hook
          const result = await uploadCoverArtMutation.mutateAsync({
            fileName: formData.coverArt.name,
            fileType: formData.coverArt.type,
            fileSize: formData.coverArt.size,
            fileData: fileData,
          });

          const updatedData = {
            ...formData,
            imageUrl: result.data.ipfsUrl,
            imageHash: result.data.fileHash,
          };
          setFormData(updatedData);
          onSubmit(updatedData);
        } catch (error: any) {
          console.error("Cover art upload error:", error);
          toast.error(error.message || "Failed to upload cover art");
          setIsUploadingCover(false);
          return;
        }
        setIsUploadingCover(false);
      } else {
        onSubmit(formData);
      }
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
      formData.coverArt
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

        {/* Creator Information */}
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

        {/* Cover Art & Media */}
        <div className="space-y-6">
          <div className="border-b pb-2">
            <h3 className="font-semibold text-lg">Cover Art & Media</h3>
            <p className="text-muted-foreground text-sm">
              Required for Story Protocol registration
            </p>
          </div>

          {/* Cover Art */}
          <div className="space-y-2">
            <Label htmlFor="coverArt">Cover Art *</Label>

            {/* Cover Art Upload Area */}
            <div
              className={`relative cursor-pointer rounded-lg border-2 border-dashed transition-all duration-200 ${
                formData.coverArt || coverPreview
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/30 hover:border-primary/50 hover:bg-accent/50"
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleCoverArtSelect}
                className="hidden"
              />

              {coverPreview ? (
                // Show cover art preview
                <div className="flex items-center space-x-4 p-4">
                  <div className="relative h-20 w-20 overflow-hidden rounded-lg">
                    <img
                      src={coverPreview}
                      alt="Cover art preview"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-primary">Cover Art Selected</h4>
                    <p className="text-muted-foreground text-sm">{formData.coverArt?.name}</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                    >
                      Change Cover Art
                    </Button>
                  </div>
                </div>
              ) : (
                // Show upload prompt
                <div className="flex flex-col items-center justify-center space-y-3 p-8">
                  <div className="rounded-full bg-primary/10 p-3">
                    <ImageIcon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-center">
                    <h4 className="font-medium">Upload Cover Art</h4>
                    <p className="text-muted-foreground text-sm">Click to select an image file</p>
                  </div>
                  <div className="text-muted-foreground text-xs">PNG, JPG, WebP • Max 10MB</div>
                </div>
              )}
            </div>
            {errors.coverArt && <p className="text-red-500 text-sm">{errors.coverArt}</p>}
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

        {/* Technical Information */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Technical Information</h3>

          {/* Media Type (Auto-detected) */}
          <div className="space-y-2">
            <Label>Media Type</Label>
            <Input
              value={formData.mediaType}
              readOnly
              className="bg-muted"
              placeholder="Auto-detected from audio file"
            />
            <p className="text-muted-foreground text-xs">
              Automatically detected from your uploaded audio file
            </p>
          </div>
        </div>

        {/* Story Protocol Registration Preview */}
        <div className="rounded-lg border bg-gradient-to-br from-primary/5 to-primary/10 p-6">
          <h3 className="mb-4 font-semibold text-lg">Story Protocol Registration Preview</h3>

          <div className="flex items-start space-x-4">
            {/* Cover Art Preview */}
            <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
              {coverPreview ? (
                <img
                  src={coverPreview}
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
                <span className="rounded-full bg-primary/20 px-2 py-1 text-primary">
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

        {/* Action Buttons */}
        <div className="flex items-center justify-between border-t pt-6">
          <Button type="button" variant="outline" onClick={onBack}>
            ← Back to Upload
          </Button>

          <Button
            type="submit"
            disabled={!isFormValid()}
            className="bg-primary hover:bg-primary/90"
          >
            Continue to Registration →
          </Button>
        </div>
      </form>
    </div>
  );
}
