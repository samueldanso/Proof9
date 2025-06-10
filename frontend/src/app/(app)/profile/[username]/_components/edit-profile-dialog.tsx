"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/api/client";
import { Camera, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useAccount } from "wagmi";

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentDisplayName: string;
  currentUsername?: string | null;
  currentAvatarUrl?: string | null;
  onProfileUpdate: () => void;
}

export function EditProfileDialog({
  open,
  onOpenChange,
  currentDisplayName,
  currentUsername,
  currentAvatarUrl,
  onProfileUpdate,
}: EditProfileDialogProps) {
  const { address } = useAccount();
  const [displayName, setDisplayName] = useState(currentDisplayName);
  const [username, setUsername] = useState(currentUsername || "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>(currentAvatarUrl || "");
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync form state with props when dialog opens or props change
  useEffect(() => {
    if (open) {
      setDisplayName(currentDisplayName);
      setUsername(currentUsername || "");
      setAvatarFile(null);
      setAvatarPreview(currentAvatarUrl || "");
    }
  }, [open, currentDisplayName, currentUsername, currentAvatarUrl]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
    }
  };

  const uploadAvatar = async (file: File): Promise<string | null> => {
    try {
      // Convert file to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          const base64 = result.split(",")[1];
          resolve(base64);
        };
        reader.onerror = reject;
      });
      reader.readAsDataURL(file);

      const base64Data = await base64Promise;

      const uploadResponse = await apiClient.post<{ avatarUrl: string }>("/api/upload/avatar", {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        fileData: base64Data,
      });

      if (uploadResponse.success) {
        return uploadResponse.data.avatarUrl;
      } else {
        throw new Error(uploadResponse.error || "Failed to upload avatar");
      }
    } catch (error) {
      console.error("Avatar upload error:", error);
      throw error;
    }
  };

  const handleSave = async () => {
    if (!displayName.trim() || !address) {
      toast.error("Please enter a display name");
      return;
    }

    setIsLoading(true);
    try {
      let avatarUrl: string | null = currentAvatarUrl || null;

      // Upload new avatar if user selected one
      if (avatarFile) {
        toast.info("Uploading avatar...");
        avatarUrl = await uploadAvatar(avatarFile);
      }

      // Update profile
      const response = await apiClient.put(`/api/users/${address}`, {
        display_name: displayName.trim(),
        username: username.trim() || undefined,
        avatar_url: avatarUrl,
      });

      if (response.success) {
        toast.success("Profile updated successfully!");
        onProfileUpdate();
        onOpenChange(false);
      } else {
        toast.error(response.error || "Failed to update profile");
      }
    } catch (error) {
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setDisplayName(currentDisplayName);
    setUsername(currentUsername || "");
    setAvatarFile(null);
    setAvatarPreview(currentAvatarUrl || "");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>

        <div className="flex w-full flex-col gap-6 py-4">
          {/* Avatar Upload */}
          <div
            className="flex h-[120px] w-full cursor-pointer items-center justify-center rounded-[16px] border-2 border-muted-foreground/30 border-dashed transition-colors hover:border-muted-foreground/50"
            onClick={handleAvatarClick}
          >
            <div className="relative flex aspect-square w-[80px] items-center justify-center rounded-full bg-muted">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Profile preview"
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <User className="h-6 w-6 text-muted-foreground" />
              )}
              <div className="absolute right-0 bottom-0 flex h-6 w-6 items-center justify-center rounded-full bg-[#ced925] text-black">
                <Camera className="h-3 w-3" />
              </div>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
          />

          {/* Display Name Input */}
          <div className="space-y-2">
            <label htmlFor="displayName" className="font-medium text-foreground text-sm">
              Display Name
            </label>
            <Input
              id="displayName"
              placeholder="Enter your display name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="h-11"
            />
          </div>

          {/* Username Input */}
          <div className="space-y-2">
            <label htmlFor="username" className="font-medium text-foreground text-sm">
              Username
            </label>
            <Input
              id="username"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ""))}
              className="h-11"
            />
            <p className="text-muted-foreground text-xs">
              3-30 characters, letters and numbers only
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!displayName.trim() || isLoading}
              className="flex-1 bg-[#ced925] text-black hover:bg-[#b8c220] disabled:opacity-50"
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
