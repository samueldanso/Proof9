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
      console.log("🖼️ DEBUG: Starting avatar upload for file:", file.name);

      // Convert file to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          // Remove data URL prefix to get pure base64
          const base64 = result.split(",")[1];
          console.log("📝 DEBUG: File converted to base64, length:", base64.length);
          resolve(base64);
        };
        reader.onerror = reject;
      });
      reader.readAsDataURL(file);

      const base64Data = await base64Promise;

      console.log("📤 DEBUG: Uploading avatar with data:", {
        mediaName: file.name,
        mediaType: file.type,
        mediaSize: file.size,
        base64Length: base64Data.length
      });

      // Use the upload avatar hook
      const result = await uploadAvatarMutation.mutateAsync({
        mediaName: file.name,
        mediaType: file.type,
        mediaSize: file.size,
        mediaData: base64Data,
      });

      console.log("✅ DEBUG: Avatar upload successful:", result);
      console.log("🔗 DEBUG: Avatar URL:", result.data.avatarUrl);
      return result.data.avatarUrl;
    } catch (error) {
      console.error("❌ DEBUG: Avatar upload error:", error);
      throw error;
    }
  };

  const handleComplete = async () => {
    console.log("🚀 DEBUG: Starting profile creation process");
    console.log("👤 DEBUG: User address:", address);
    console.log("📝 DEBUG: Display name:", displayName.trim());
    console.log("🖼️ DEBUG: Avatar file selected:", !!avatarFile);

    if (!displayName.trim() || !address) {
      console.error("❌ DEBUG: Missing required data - displayName or address");
      toast.error("Please enter a display name");
      return;
    }

    try {
      let avatarUrl: string | null = null;

      // Upload avatar if user selected one
      if (avatarFile) {
        console.log("📤 DEBUG: Uploading avatar...");
        toast.info("Uploading avatar...");
        avatarUrl = await uploadAvatar(avatarFile);
        console.log("✅ DEBUG: Avatar uploaded, URL:", avatarUrl);
      } else {
        console.log("⏭️ DEBUG: No avatar file selected, skipping upload");
      }

      console.log("👤 DEBUG: Creating profile with data:", {
        address,
        display_name: displayName.trim(),
        avatar_url: avatarUrl || "null"
      });

      // Use the create profile hook
      const response = await createProfileMutation.mutateAsync({
        address,
        display_name: displayName.trim(),
        avatar_url: avatarUrl || undefined,
      });

      console.log("📋 DEBUG: Profile creation response:", response);

      if (response.success) {
        console.log("🎉 DEBUG: Profile created successfully!");
        toast.success("Profile created successfully!");
        // Small delay to show the toast before reload
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        console.error("❌ DEBUG: Profile creation failed:", response.error);
        toast.error(response.error || "Failed to create profile");
      }
    } catch (error) {
      console.error("💥 DEBUG: Profile creation error:", error);
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
