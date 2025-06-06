"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X } from "lucide-react";
import { useState } from "react";

interface MetadataFormData {
  title: string;
  description: string;
  genre: string;
  tags: string[];
}

interface MetadataFormProps {
  initialData?: MetadataFormData;
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

export default function MetadataForm({ initialData, onSubmit, onNext, onBack }: MetadataFormProps) {
  const [formData, setFormData] = useState<MetadataFormData>({
    title: initialData?.title || "",
    description: initialData?.description || "",
    genre: initialData?.genre || "",
    tags: initialData?.tags || [],
  });

  const [newTag, setNewTag] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.genre) {
      newErrors.genre = "Genre is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit(formData);
      // onNext is called automatically by parent
    }
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
      <div className="space-y-2 text-center">
        <h2 className="font-bold text-2xl">Track Details</h2>
        <p className="text-muted-foreground">
          Add information about your track for better discoverability
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
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

        {/* Preview Card */}
        <Card className="p-4">
          <h4 className="mb-3 font-medium">Preview</h4>
          <div className="space-y-2">
            <h5 className="font-semibold">{formData.title || "Your Track Title"}</h5>
            <p className="text-muted-foreground text-sm">
              {formData.description || "Your track description will appear here..."}
            </p>
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

          <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90">
            Continue →
          </Button>
        </div>
      </form>
    </div>
  );
}
