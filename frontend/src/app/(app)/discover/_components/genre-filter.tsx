"use client";

import { useState } from "react";

interface GenreFilterProps {
  activeGenre: string;
  onGenreChange: (genre: string) => void;
}

// Popular music genres for the platform - matching current page structure
const POPULAR_GENRES = [
  "All",
  "Electronic",
  "Hip Hop",
  "Pop",
  "Rock",
  "Jazz",
  "Classical",
  "R&B",
  "Country",
  "Folk",
  "Blues",
  "Reggae",
  "Punk",
  "Metal",
  "Alternative",
  "Indie",
  "World",
  "Other",
];

export default function GenreFilter({ activeGenre, onGenreChange }: GenreFilterProps) {
  const [showAll, setShowAll] = useState(false);

  // Show first 8 genres by default, all when expanded
  const displayedGenres = showAll ? POPULAR_GENRES : POPULAR_GENRES.slice(0, 8);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Genre Chips */}
      {displayedGenres.map((genre) => (
        <button
          key={genre}
          type="button"
          className={`rounded-full px-3 py-1.5 font-medium text-sm transition-all ${
            activeGenre === genre
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
          }`}
          onClick={() => onGenreChange(genre)}
        >
          {genre}
        </button>
      ))}

      {/* Show More/Less Button */}
      {POPULAR_GENRES.length > 8 && (
        <button
          type="button"
          className="rounded-full px-3 py-1.5 font-medium text-muted-foreground text-sm transition-colors hover:text-foreground"
          onClick={() => setShowAll(!showAll)}
        >
          {showAll ? "Show Less" : `+${POPULAR_GENRES.length - 8} More`}
        </button>
      )}
    </div>
  );
}
