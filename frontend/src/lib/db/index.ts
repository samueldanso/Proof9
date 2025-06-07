// Main database exports
export * from "./schemas";
export {
  trackQueries,
  socialQueries,
  monetizationQueries,
  profileQueries,
  subscriptions,
} from "./queries";

// Convenience re-exports for common operations
export { supabase } from "@/lib/supabase/client";

// Import the queries for destructuring
import {
  monetizationQueries,
  profileQueries,
  socialQueries,
  trackQueries,
} from "./queries";

// Shorthand exports for most common operations
export const {
  getAll: getTracks,
  getById: getTrack,
  getByArtist: getTracksByArtist,
  create: createTrack,
  update: updateTrack,
  incrementPlays: incrementTrackPlays,
} = trackQueries;

export const {
  likes: {
    toggle: toggleLike,
    isLiked: isTrackLiked,
    getForTrack: getTrackLikes,
  },
  comments: { add: addComment, getForTrack: getTrackComments },
  follows: { toggle: toggleFollow, getFollowers, getFollowing },
} = socialQueries;

export const { getOrCreate: getUserProfile, update: updateUserProfile } =
  profileQueries;
