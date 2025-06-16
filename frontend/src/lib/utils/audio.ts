/**
 * Extract duration from an audio file
 * @param file - The audio file to analyze
 * @returns Promise that resolves to duration in "MM:SS" format
 */
export function extractAudioDuration(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    // Create a temporary URL for the file
    const url = URL.createObjectURL(file);

    // Create an audio element
    const audio = new Audio();

    // Set up event listeners
    audio.addEventListener("loadedmetadata", () => {
      // Clean up the object URL
      URL.revokeObjectURL(url);

      // Get duration in seconds
      const durationInSeconds = audio.duration;

      // Check if duration is valid
      if (Number.isNaN(durationInSeconds) || !Number.isFinite(durationInSeconds)) {
        reject(new Error("Could not determine audio duration"));
        return;
      }

      // Convert to MM:SS format
      const minutes = Math.floor(durationInSeconds / 60);
      const seconds = Math.floor(durationInSeconds % 60);
      const formattedDuration = `${minutes}:${seconds.toString().padStart(2, "0")}`;

      resolve(formattedDuration);
    });

    audio.addEventListener("error", () => {
      // Clean up the object URL
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load audio file for duration extraction"));
    });

    // Start loading the audio file
    audio.src = url;
    audio.preload = "metadata";
  });
}

/**
 * Format duration from seconds to MM:SS format
 * @param seconds - Duration in seconds
 * @returns Formatted duration string
 */
export function formatDuration(seconds: number): string {
  if (Number.isNaN(seconds) || !Number.isFinite(seconds)) {
    return "0:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

/**
 * Parse duration from MM:SS format to seconds
 * @param duration - Duration string in MM:SS format
 * @returns Duration in seconds
 */
export function parseDuration(duration: string): number {
  const parts = duration.split(":");
  if (parts.length !== 2) {
    return 0;
  }

  const minutes = Number.parseInt(parts[0], 10);
  const seconds = Number.parseInt(parts[1], 10);

  if (Number.isNaN(minutes) || Number.isNaN(seconds)) {
    return 0;
  }

  return minutes * 60 + seconds;
}
