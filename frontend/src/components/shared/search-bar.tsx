import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import React from "react";

export const SearchBar = () => {
  return (
    <div className="relative w-full max-w-md">
      <Search className="-translate-y-1/2 absolute top-1/2 left-4 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder="Search for inspiration..."
        className="h-10 rounded-full border-none bg-muted/50 pr-4 pl-11 focus:bg-background focus:ring-2 focus:ring-ring"
      />
    </div>
  );
};
