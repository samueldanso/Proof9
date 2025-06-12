"use client";

import { ProfileHeader } from "./_components/profile-header";
import { ProfileTabs } from "./_components/profile-tabs";

export default function ProfilePage() {
  return (
    <div className="w-full space-y-8">
      {/* Profile Header - Consistent with other pages */}
      <div className="mx-auto max-w-7xl px-4">
        <ProfileHeader />
      </div>

      {/* Profile Tabs - Consistent with other pages */}
      <div className="mx-auto max-w-7xl px-4">
        <ProfileTabs />
      </div>

      {/* Main Content Area - Left aligned like discover */}
      <div className="flex w-full gap-6">
        <div className="flex-1 space-y-6">
          {/* Content below tabs goes here */}
        </div>

        {/* Potential future sidebar space */}
        <div className="hidden w-72 lg:block">
          {/* Reserved for future content */}
        </div>
      </div>
    </div>
  );
}
