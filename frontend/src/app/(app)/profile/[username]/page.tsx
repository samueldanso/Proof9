"use client";

import { ProfileHeader } from "./_components/profile-header";
import { ProfileTabs } from "./_components/profile-tabs";

export default function ProfilePage() {
  return (
    <div className="w-full space-y-8">
      {/* Profile Header - Centered */}
      <div className="mx-auto max-w-2xl">
        <ProfileHeader />
      </div>

      {/* Main Content Area - Left aligned like discover */}
      <div className="flex w-full gap-6">
        <div className="flex-1 space-y-6">
          <ProfileTabs />
        </div>

        {/* Potential future sidebar space */}
        <div className="w-72 hidden lg:block">
          {/* Reserved for future content */}
        </div>
      </div>
    </div>
  );
}
