"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageIcon, Plus, Upload, X } from "lucide-react";
import { useState, useRef } from "react";
import { useAccount } from "wagmi";
import { toast } from "sonner";
import { useUploadCoverArt } from "@/hooks/api";

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
  onBack
}: MetadataFormProps) {
  const { address } = useAccount();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadCoverArtMutation = useUploadCoverArt();

  const [formData, setFormData] = useState<MetadataFormData>({
    title: initialData?.title || "",
    description: initialData?.description || "",
    genre: initialData?.genre || "",
    tags: initialData?.tags || [],
    // Auto-fill creator info from wallet
    creators: initialData?.creators || [
      {
        name: "", // Will be filled from user profile
        address: address || "",
        contributionPercent: 100,
      }
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

  const [newTag, setNewTag] = useState("");
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
    if (formData.creators.length > 0 && (!formData.creators[0]?.address || !formData.creators[0]?.contributionPercent)) {
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
    if (!file.type.startsWith('image/')) {
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
    setFormData(prev => ({
      ...prev,
      coverArt: file,
    }));

    toast.success("Cover art selected");
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim()) && formData.tags.length < 10) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="font-bold text-2xl">Track Details</h2>
        <p className="text-muted-foreground">
          Add information about your track for Story Protocol registration
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Track Information */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Basic Information</h3>

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

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your track, its inspiration, or story behind it..."
              rows={4}
              className={errors.description ? "border-red-500" : ""}
            />
            {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
          </div>

          {/* Genre */}
          <div className="space-y-2">
            <Label htmlFor="genre">Genre *</Label>
            <select
              id="genre"
              value={formData.genre}
              onChange={(e) => setFormData((prev) => ({ ...prev, genre: e.target.value }))}
              className={`flex h-10 w-full rounded-md border px-3 py-2 text-sm transition-colors ${
                errors.genre
                  ? "border-red-500"
                  : "border-input bg-background hover:border-accent-foreground/25"
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

        {/* Creator Information (Story Protocol Required) */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Creator Information</h3>
          <p className="text-muted-foreground text-sm">
            Required for Story Protocol IP registration
          </p>

          {/* Creator Name */}
          <div className="space-y-2">
            <Label htmlFor="creatorName">Creator Name *</Label>
                          <Input
                id="creatorName"
                value={formData.creators[0]?.name || ""}
                onChange={(e) => setFormData((prev) => ({
                  ...prev,
                  creators: [
                    {
                      name: e.target.value,
                      address: prev.creators[0]?.address || address || "",
                      contributionPercent: prev.creators[0]?.contributionPercent || 100,
                    },
                  ],
                }))}
                placeholder="Your artist/creator name"
                className={errors.creators ? "border-red-500" : ""}
              />
            {errors.creators && <p className="text-red-500 text-sm">{errors.creators}</p>}
          </div>

          {/* Creator Address (Auto-filled) */}
          <div className="space-y-2">
            <Label htmlFor="creatorAddress">Creator Address *</Label>
            <Input
              id="creatorAddress"
              value={formData.creators[0]?.address || ""}
              readOnly
              className="bg-muted"
              placeholder="Connect wallet to auto-fill"
            />
            {errors.creators && <p className="text-red-500 text-sm">{errors.creators}</p>}
            <p className="text-muted-foreground text-xs">
              This is automatically filled from your connected wallet
            </p>
          </div>

          {/* Contribution Percent */}
          <div className="space-y-2">
            <Label htmlFor="contributionPercent">Contribution Percentage *</Label>
                          <Input
                id="contributionPercent"
                type="number"
                min="1"
                max="100"
                value={formData.creators[0]?.contributionPercent || 100}
                onChange={(e) => setFormData((prev) => ({
                  ...prev,
                  creators: [
                    {
                      name: prev.creators[0]?.name || "",
                      address: prev.creators[0]?.address || address || "",
                      contributionPercent: parseInt(e.target.value) || 100,
                    },
                  ],
                }))}
                className={errors.creators ? "border-red-500" : ""}
              />
            {errors.creators && <p className="text-red-500 text-sm">{errors.creators}</p>}
            <p className="text-muted-foreground text-xs">
              Percentage of creative contribution (default: 100% for solo creators)
            </p>
          </div>
        </div>

        {/* Cover Art Upload (Story Protocol Required) */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Cover Art</h3>
          <p className="text-muted-foreground text-sm">
            Required for Story Protocol registration (image.* fields)
          </p>

          <div className="space-y-2">
            <Label>Cover Art *</Label>

            {/* Upload Button */}
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingCover}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                {formData.coverArt ? "Change Cover Art" : "Upload Cover Art"}
              </Button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleCoverArtSelect}
                className="hidden"
              />

              {isUploadingCover && <span className="text-sm text-muted-foreground">Uploading...</span>}
            </div>

            {errors.coverArt && <p className="text-red-500 text-sm">{errors.coverArt}</p>}

            {/* Cover Art Preview */}
            {(coverPreview || formData.imageUrl) && (
              <Card className="p-4">
                <div className="flex items-center gap-4">
                  <div className="relative h-20 w-20 overflow-hidden rounded-lg">
                    <img
                      src={coverPreview || formData.imageUrl}
                      alt="Cover art preview"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Cover Art Selected</p>
                    <p className="text-muted-foreground text-sm">
                      {formData.coverArt?.name || "Uploaded image"}
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-3">
          <Label>Tags (Optional)</Label>
          <p className="text-muted-foreground text-sm">
            Add up to 10 tags to help people discover your track
          </p>

          {/* Tag Input */}
          <div className="flex gap-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Add a tag..."
              className="flex-1"
              maxLength={20}
            />
            <Button
              type="button"
              onClick={addTag}
              variant="outline"
              size="sm"
              disabled={
                !newTag.trim() ||
                formData.tags.includes(newTag.trim()) ||
                formData.tags.length >= 10
              }
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Tag Display */}
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          <p className="text-muted-foreground text-xs">{formData.tags.length}/10 tags</p>
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

        {/* Preview Card */}
        <Card className="p-4">
          <h4 className="mb-3 font-medium">Story Protocol Registration Preview</h4>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Title:</span> {formData.title || "Your Track Title"}
              </div>
              <div>
                <span className="font-medium">Creator:</span> {formData.creators[0]?.name || "Creator Name"}
              </div>
              <div>
                <span className="font-medium">Genre:</span> {formData.genre || "Not selected"}
              </div>
              <div>
                <span className="font-medium">Media Type:</span> {formData.mediaType || "Not detected"}
              </div>
            </div>

            <div>
              <span className="font-medium text-sm">Description:</span>
              <p className="text-muted-foreground text-sm mt-1">
                {formData.description || "Your track description will appear here..."}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {formData.genre && <Badge variant="outline">{formData.genre}</Badge>}
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
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={onBack} className="flex-1">
            ← Back
          </Button>

          <Button
            type="submit"
            className="flex-1 bg-primary hover:bg-primary/90"
            disabled={isUploadingCover}
          >
            {isUploadingCover ? "Processing..." : "Continue →"}
          </Button>
        </div>
      </form>
    </div>
  );
}
