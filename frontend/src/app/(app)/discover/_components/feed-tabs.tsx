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
    <div className="flex w-full flex-col gap-4">
      {/* Tab Headers - Rounded pill design with softer colors */}
      <div className="flex items-center gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`px-4 py-2 rounded-full font-medium text-sm transition-all ${
              activeTab === tab.key
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent/30 hover:text-foreground"
            }`}
            onClick={() => onTabChange(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
