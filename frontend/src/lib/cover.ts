/**
 * Get cover art URL with fallback to default cover
 * @param coverUrl - Track's custom cover URL
 * @param genre - Track genre for themed default covers (optional)
 * @returns Cover URL to display (either custom or default)
 */
export function getCoverUrl(coverUrl?: string | null, genre?: string | null): string {
  // If track has a custom cover, use it
  if (coverUrl?.trim()) {
    return coverUrl;
  }

  // Otherwise, use default cover
  return "/cover.png";
}

/**
 * Get cover art with genre-based theming (future enhancement)
 * @param coverUrl - Track's custom cover URL
 * @param genre - Track genre for themed covers
 * @returns Cover URL with potential genre theming
 */
export function getThemedCoverUrl(coverUrl?: string | null, genre?: string | null): string {
  // If track has a custom cover, use it
  if (coverUrl?.trim()) {
    return coverUrl;
  }

  // Future: could return genre-specific covers
  // For now, return default
  return "/cover.png";
}

/**
 * Check if a cover URL is the default cover
 * @param coverUrl - Cover URL to check
 * @returns True if using default cover
 */
export function isDefaultCover(coverUrl?: string | null): boolean {
  return !coverUrl?.trim() || coverUrl === "/cover.png";
}

/**
 * Generate cover placeholder based on track title (future enhancement)
 * @param title - Track title
 * @returns Placeholder text for cover
 */
export function getCoverPlaceholder(title?: string | null): string {
  if (!title) return "♪";

  // Get first letter of title or use music note
  return title.charAt(0).toUpperCase() || "♪";
}
