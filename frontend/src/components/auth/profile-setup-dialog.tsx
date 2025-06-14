"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useCreateProfile, useUploadAvatar } from "@/hooks/api";
import { useQueryClient } from "@tanstack/react-query";
import { Camera, User } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  // Use hooks for API calls
  const uploadAvatarMutation = useUploadAvatar();
  const createProfileMutation = useCreateProfile();

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

      // Use the upload avatar hook
      const result = await uploadAvatarMutation.mutateAsync({
        mediaName: file.name,
        mediaType: file.type,
        mediaSize: file.size,
        mediaData: base64Data,
      });

      return result.data.avatarUrl;
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

    try {
      let avatarUrl: string | null = null;

      // Upload avatar if user selected one
      if (avatarFile) {
        toast.info("Uploading avatar...");
        avatarUrl = await uploadAvatar(avatarFile);
      }

      // Use the create profile hook
      const response = await createProfileMutation.mutateAsync({
        address: userAddress,
        display_name: displayName.trim(),
        avatar_url: avatarUrl || undefined,
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
    }
  };

  const isLoading = uploadAvatarMutation.isPending || createProfileMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={() => {}} modal>
      <DialogContent className="sm:max-w-[400px] [&>button]:hidden">
        <DialogHeader>
          <DialogTitle className="text-center">Complete Your Profile</DialogTitle>
          <p className="text-center text-muted-foreground text-sm">
            Set up your profile to get started on Proof9
          </p>
        </DialogHeader>

        <div className="flex w-full flex-col gap-6 py-4">
          {/* Avatar Upload (Optional) */}
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

          {/* Display Name Input (Required) */}
          <div className="space-y-2">
            <label htmlFor="displayName" className="font-medium text-foreground text-sm">
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
            <p className="text-muted-foreground text-xs">
              This will be used to generate your username and help others find you
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
