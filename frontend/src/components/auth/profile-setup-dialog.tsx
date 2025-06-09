"use client";

import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Camera } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api/client";
import { useQueryClient } from "@tanstack/react-query";

interface ProfileSetupDialogProps {
  open: boolean;
  onProfileSetupComplete: () => void;
  userAddress: string;
}

export function ProfileSetupDialog({
  open,
  onProfileSetupComplete,
  userAddress,
}: ProfileSetupDialogProps) {
  const [displayName, setDisplayName] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

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

      const uploadResponse = await apiClient.post<{ avatarUrl: string }>(
        "/api/upload/avatar",
        {
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          fileData: base64Data,
        }
      );

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

  const handleSetupProfile = async () => {
    if (!displayName.trim()) {
      toast.error("Please enter a display name");
      return;
    }

    setIsLoading(true);
    try {
      let avatarUrl: string | null = null;

      // Upload avatar if user selected one
      if (avatarFile) {
        toast.info("Uploading avatar...");
        avatarUrl = await uploadAvatar(avatarFile);
      }

      // Create or update profile
      const response = await apiClient.post("/api/users/create-profile", {
        address: userAddress,
        display_name: displayName.trim(),
        avatar_url: avatarUrl,
      });

      if (response.success) {
        toast.success("Profile setup complete! Welcome to Proof9!");

        // Invalidate queries to refetch user data
        queryClient.invalidateQueries({ queryKey: ["user", userAddress] });

        onProfileSetupComplete();
      } else {
        toast.error(response.error || "Failed to setup profile");
      }
    } catch (error) {
      toast.error("Failed to setup profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}} modal>
      <DialogContent className="sm:max-w-[400px] [&>button]:hidden">
        <DialogHeader>
          <DialogTitle className="text-center">
            Complete Your Profile
          </DialogTitle>
          <p className="text-center text-sm text-muted-foreground">
            Set up your profile to get started on Proof9
          </p>
        </DialogHeader>

        <div className="flex w-full flex-col gap-6 py-4">
          {/* Avatar Upload (Optional) */}
          <div
            className="flex h-[120px] w-full cursor-pointer items-center justify-center rounded-[16px] border-2 border-dashed border-muted-foreground/30 transition-colors hover:border-muted-foreground/50"
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
              <div className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full bg-[#ced925] text-black">
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

          {/* Display Name Input (Required) */}
          <div className="space-y-2">
            <label
              htmlFor="displayName"
              className="text-sm font-medium text-foreground"
            >
              Display Name <span className="text-red-500">*</span>
            </label>
            <Input
              id="displayName"
              placeholder="Enter your display name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="h-11"
              required
            />
            <p className="text-xs text-muted-foreground">
              This will be used to generate your username and help others find
              you
            </p>
          </div>

          {/* Action Button */}
          <Button
            onClick={handleSetupProfile}
            disabled={!displayName.trim() || isLoading}
            className="w-full bg-[#ced925] text-black hover:bg-[#b8c220] disabled:opacity-50"
          >
            {isLoading ? "Setting up..." : "Complete Setup"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
