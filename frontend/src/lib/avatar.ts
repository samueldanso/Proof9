/**
 * Get avatar URL with fallback to default avatar
 * @param avatarUrl - User's custom avatar URL
 * @returns Avatar URL to display (either custom or default)
 */
export function getAvatarUrl(avatarUrl?: string | null): string {
  // If user has a custom avatar, use it
  if (avatarUrl && avatarUrl.trim()) {
    return avatarUrl;
  }

  // Otherwise, use default avatar
  return "/default-avatar.svg";
}

/**
 * Get user initials for avatar fallback
 * @param name - User's display name or address
 * @returns Two-character initials
 */
export function getUserInitials(name?: string | null): string {
  if (!name) return "?";

  // If it's an address (starts with 0x), use first 2 hex chars after 0x
  if (name.startsWith("0x") && name.length >= 4) {
    return name.substring(2, 4).toUpperCase();
  }

  // For regular names, get first letter of each word (max 2)
  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    // Single word - take first 2 characters
    return words[0].substring(0, 2).toUpperCase();
  } else {
    // Multiple words - take first letter of first two words
    return (words[0][0] + words[1][0]).toUpperCase();
  }
}
