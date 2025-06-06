"use client";

import { ProfileHeader } from "./_components/profile-header";
import { ProfileTabs } from "./_components/profile-tabs";

export default function ProfilePage() {
  // Mock data for demo - in real app this would come from API
  const mockStats = {
    trackCount: 3,
    followingCount: 125,
    followersCount: 2487,
  };

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="space-y-6">
        {/* Profile Header */}
        <ProfileHeader
          trackCount={mockStats.trackCount}
          followingCount={mockStats.followingCount}
          followersCount={mockStats.followersCount}
        />

        {/* Profile Tabs */}
        <ProfileTabs />
      </div>
    </div>
  );
}
