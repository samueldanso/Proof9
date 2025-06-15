import type { Track } from "@/types/track";

export interface TrackValidationResult {
  isValid: boolean;
  issues: string[];
  audioPlayable: boolean;
  imageDisplayable: boolean;
}

/**
 * Validate track data to identify missing or problematic fields
 * @param track - Track object to validate
 * @returns Validation result with issues identified
 */
export function validateTrack(track: Track): TrackValidationResult {
  const issues: string[] = [];
  let audioPlayable = false;
  let imageDisplayable = false;

  // Check required fields
  if (!track.id) issues.push("Missing track ID");
  if (!track.title) issues.push("Missing track title");

  // Check audio fields
  if (!track.mediaUrl) {
    issues.push("Missing mediaUrl - track won't play");
  } else {
    // Validate URL format
    try {
      new URL(track.mediaUrl);
      audioPlayable = true;
    } catch {
      issues.push("Invalid mediaUrl format - track won't play");
    }
  }

  if (!track.mediaType) {
    issues.push("Missing mediaType");
  }

  // Check image fields
  if (!track.image) {
    issues.push("Missing image - using default cover");
  } else {
    // Validate URL format
    try {
      new URL(track.image);
      imageDisplayable = true;
    } catch {
      issues.push("Invalid image URL format - using default cover");
    }
  }

  // Check creators
  if (!track.creators || track.creators.length === 0) {
    issues.push("Missing creators information");
  } else {
    const primaryCreator = track.creators[0];
    if (!primaryCreator.name) issues.push("Missing primary creator name");
    if (!primaryCreator.address) issues.push("Missing primary creator address");
  }

  // Check duration
  if (!track.duration) {
    issues.push("Missing duration");
  }

  return {
    isValid: issues.length === 0,
    issues,
    audioPlayable,
    imageDisplayable,
  };
}

/**
 * Log track validation issues to console
 * @param track - Track to validate
 * @param context - Context where validation is happening
 */
export function logTrackValidation(track: Track, context: string): void {
  const validation = validateTrack(track);

  if (validation.issues.length > 0) {
    console.warn(`🚨 Track validation issues in ${context}:`, {
      trackId: track.id,
      trackTitle: track.title,
      issues: validation.issues,
      audioPlayable: validation.audioPlayable,
      imageDisplayable: validation.imageDisplayable,
    });
  } else {
    console.log(`✅ Track validation passed in ${context}:`, {
      trackId: track.id,
      trackTitle: track.title,
    });
  }
}

/**
 * Get a summary of common track data issues across multiple tracks
 * @param tracks - Array of tracks to analyze
 * @returns Summary of issues
 */
export function analyzeTracksData(tracks: Track[]): {
  totalTracks: number;
  tracksWithAudio: number;
  tracksWithImages: number;
  commonIssues: Record<string, number>;
} {
  const summary = {
    totalTracks: tracks.length,
    tracksWithAudio: 0,
    tracksWithImages: 0,
    commonIssues: {} as Record<string, number>,
  };

  tracks.forEach((track) => {
    const validation = validateTrack(track);

    if (validation.audioPlayable) summary.tracksWithAudio++;
    if (validation.imageDisplayable) summary.tracksWithImages++;

    validation.issues.forEach((issue) => {
      summary.commonIssues[issue] = (summary.commonIssues[issue] || 0) + 1;
    });
  });

  console.log("📊 Track Data Analysis:", summary);
  return summary;
}
