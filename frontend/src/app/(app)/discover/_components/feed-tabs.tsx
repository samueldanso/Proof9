"use client";

interface FeedTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function FeedTabs({ activeTab, onTabChange }: FeedTabsProps) {
  const tabs = [
    { key: "following", label: "Following" },
    { key: "verified", label: "Verified" },
    { key: "trending", label: "Trending" },
  ];

  return (
    <div className="flex w-full flex-col gap-3">
      {/* Tab Headers - Simple text buttons like profile tabs */}
      <div className="flex items-center gap-6 font-medium text-muted-foreground">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`cursor-pointer transition-colors ${
              activeTab === tab.key ? "text-foreground" : "hover:text-foreground/80"
            }`}
            onClick={() => onTabChange(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Optional: Add subtle divider */}
      <div className="h-px bg-border" />
    </div>
  );
}
