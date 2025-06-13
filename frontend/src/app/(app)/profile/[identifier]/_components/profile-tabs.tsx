"use client";

import { useUser } from "@/hooks/api";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useAccount } from "wagmi";
import { EarningsTab } from "./earnings-tab";
import { LicenseesTab } from "./licensees-tab";
import { TrackList } from "./track-list";

export function ProfileTabs() {
  const params = useParams();
  const { address: connectedAddress } = useAccount();
  const profileIdentifier = params.identifier as string;

  // Get user data from API (works with both username and address)
  const { data: userResponse } = useUser(profileIdentifier);
  const userData = userResponse?.data;

  // Check if this is the current user's profile (compare addresses)
  const isOwnProfile = connectedAddress?.toLowerCase() === userData?.address?.toLowerCase();

  const [activeTab, setActiveTab] = useState<string>("releases");

  // Different tabs for own profile vs others
  const ownProfileTabs = [
    { id: "releases", label: "Releases" },
    { id: "licensees", label: "Licensees" },
    { id: "earnings", label: "Earnings" },
  ];

  const otherProfileTabs = [{ id: "releases", label: "Releases" }];

  const tabs = isOwnProfile ? ownProfileTabs : otherProfileTabs;

  const renderTabContent = () => {
    switch (activeTab) {
      case "releases":
        return <TrackList />;
      case "licensees":
        return isOwnProfile ? <LicenseesTab /> : null;
      case "earnings":
        return isOwnProfile ? <EarningsTab /> : null;
      default:
        return <TrackList />;
    }
  };

  return (
    <div className="flex w-full flex-col gap-4">
      {/* Tab Headers */}
      <div className="flex items-center gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`rounded-full px-4 py-2 font-medium text-sm transition-all ${
              activeTab === tab.id
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent/30 hover:text-foreground"
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {renderTabContent()}
    </div>
  );
}
