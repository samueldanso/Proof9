"use client";

import { useState } from "react";

interface GenreFilterProps {
  activeGenre: string | null;
  onGenreChange: (genre: string | null) => void;
}

// Popular music genres for the platform
const POPULAR_GENRES = [
  "Electronic",
  "Hip Hop",
  "Jazz",
  "Ambient",
  "Classical",
  "Pop",
  "Rock",
  "R&B",
  "Indie",
  "Folk",
  "Funk",
  "Latin",
];

export default function GenreFilter({ activeGenre, onGenreChange }: GenreFilterProps) {
  const [showAll, setShowAll] = useState(false);

  // Show first 6 genres by default, all when expanded
  const displayedGenres = showAll ? POPULAR_GENRES : POPULAR_GENRES.slice(0, 6);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* All Genres Chip */}
      <button
        type="button"
        className={`rounded-full px-3 py-1.5 font-medium text-sm transition-all ${
          !activeGenre
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
        }`}
        onClick={() => onGenreChange(null)}
      >
        All
      </button>

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
      {POPULAR_GENRES.length > 6 && (
        <button
          type="button"
          className="rounded-full px-3 py-1.5 font-medium text-muted-foreground text-sm transition-colors hover:text-foreground"
          onClick={() => setShowAll(!showAll)}
        >
          {showAll ? "Show Less" : `+${POPULAR_GENRES.length - 6} More`}
        </button>
      )}
    </div>
  );
}
