"use client";

import { useState, useRef } from "react";
import { useAccount } from "wagmi";
import { User, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StepHeader } from "../StepHeader";
import { apiClient } from "@/lib/api/client";
import { toast } from "sonner";

export function ProfileSetup() {
  const { address } = useAccount();
  const [displayName, setDisplayName] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleComplete = async () => {
    if (!displayName.trim() || !address) {
      toast.error("Please enter a display name");
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiClient.post("/api/users/create-profile", {
        address,
        display_name: displayName.trim(),
        avatar_url: null, // Will implement avatar upload later
      });

      if (response.success) {
        toast.success("Profile created successfully!");
        // Small delay to show the toast before reload
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        toast.error(response.error || "Failed to create profile");
      }
    } catch (error) {
      toast.error("Network error. Please check if the backend is running.");
    } finally {
      setIsLoading(false);
    }
  };

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
          className="flex h-[144px] w-full cursor-pointer items-center justify-center rounded-[24px] border-2 border-dashed border-muted-foreground/30 transition-colors hover:border-muted-foreground/50"
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
            <div className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-[#ced925] text-black">
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
          <label
            htmlFor="displayName"
            className="text-sm font-medium text-foreground"
          >
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
