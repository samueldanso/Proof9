"use client";

import { Badge } from "@/components/ui/badge";

interface LibraryTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  likedCount: number;
  licensedCount: number;
}

export default function LibraryTabs({
  activeTab,
  onTabChange,
  likedCount,
  licensedCount,
}: LibraryTabsProps) {
  const tabs = [
    {
      id: "liked",
      label: "Liked",
      count: likedCount,
    },
    {
      id: "licensed",
      label: "Licensed",
      count: licensedCount,
    },
  ];

  return (
    <div className="flex items-center gap-2">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={`flex items-center gap-2 rounded-full px-4 py-2 font-medium text-sm transition-all ${
            activeTab === tab.id
              ? "bg-accent text-accent-foreground"
              : "text-muted-foreground hover:bg-accent/30 hover:text-foreground"
          }`}
          onClick={() => onTabChange(tab.id)}
        >
          <span>{tab.label}</span>
          <Badge variant={activeTab === tab.id ? "default" : "secondary"} className="ml-1 text-xs">
            {tab.count}
          </Badge>
        </button>
      ))}
    </div>
  );
}
