"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateProfile, useUploadAvatar } from "@/hooks/api";
import { Camera, User } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useAccount } from "wagmi";
import { StepHeader } from "../step-header";

export function ProfileSetup() {
  const { address } = useAccount();
  const [displayName, setDisplayName] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

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
          // Remove data URL prefix to get pure base64
          const base64 = result.split(",")[1];
          resolve(base64);
        };
        reader.onerror = reject;
      });
      reader.readAsDataURL(file);

      const base64Data = await base64Promise;

      const uploadData = {
        mediaName: file.name,
        mediaType: file.type,
        mediaSize: file.size,
        mediaData: base64Data,
      };

      const result = await uploadAvatarMutation.mutateAsync(uploadData);
      return result.data.avatarUrl;
    } catch (error) {
      console.error("Avatar upload error:", error);
      throw error;
    }
  };

  const handleComplete = async () => {
    if (!displayName.trim() || !address) {
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

      // Create profile
      toast.info("Creating profile...");
      const profileData = {
        address,
        display_name: displayName.trim(),
        ...(avatarUrl && { avatar_url: avatarUrl }),
      };

      await createProfileMutation.mutateAsync(profileData);

      toast.success("Profile created successfully!");
      onComplete();
    } catch (error) {
      console.error("Profile creation error:", error);
      toast.error("Failed to create profile. Please try again.");
    }
  };

  const isLoading = uploadAvatarMutation.isPending || createProfileMutation.isPending;

  return (
    <>
      <StepHeader
        icon={<User />}
        title="Set up your profile"
        description="Let's personalize your Proof9 experience with a display name and avatar."
      />

      <div className="flex w-full flex-col gap-6 px-6">
        {/* Avatar Upload */}
        <div
          className="flex h-[144px] w-full cursor-pointer items-center justify-center rounded-[24px] border-2 border-muted-foreground/30 border-dashed transition-colors hover:border-muted-foreground/50"
          onClick={handleAvatarClick}
        >
          <div className="relative flex aspect-square w-[96px] items-center justify-center rounded-full bg-muted">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Profile preview"
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              <User className="h-8 w-8 text-muted-foreground" />
            )}
            <div className="absolute right-0 bottom-0 flex h-8 w-8 items-center justify-center rounded-full bg-[#ced925] text-black">
              <Camera className="h-4 w-4" />
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
            className="h-12"
          />
        </div>

        {/* Complete Button */}
        <Button
          onClick={handleComplete}
          disabled={!displayName.trim() || isLoading}
          className="h-12 bg-[#ced925] text-black hover:bg-[#b8c220] disabled:opacity-50"
        >
          {isLoading ? "Creating Profile..." : "Complete Setup"}
        </Button>
      </div>
    </>
  );
}
