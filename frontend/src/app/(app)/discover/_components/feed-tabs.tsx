"use client";

type TabType = "latest" | "following" | "trending";

interface FeedTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export default function FeedTabs({ activeTab, onTabChange }: FeedTabsProps) {
  const tabs: { key: TabType; label: string }[] = [
    { key: "latest", label: "Latest" },
    { key: "following", label: "Following" },
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
            className={`rounded-full px-4 py-2 font-medium text-sm transition-all ${
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
