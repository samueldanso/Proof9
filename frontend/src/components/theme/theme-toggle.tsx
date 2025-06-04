"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDark = resolvedTheme === "dark";

  return (
    <button
      className={`flex w-16 flex-col items-center gap-1 rounded-xl px-0 py-3 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground`}
      aria-label="Toggle theme"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      type="button"
    >
      <span className="flex items-center justify-center text-[22px]">
        {isDark ? <Sun /> : <Moon />}
      </span>
      <span className="font-medium text-xs leading-tight">
        {isDark ? "Light" : "Dark"}
      </span>
    </button>
  );
}
