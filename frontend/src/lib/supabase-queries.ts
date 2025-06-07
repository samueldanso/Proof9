import { supabase } from "./supabase";

// ==========================================
// SOCIAL FEATURES - SIMPLE QUERIES
// ==========================================

/**
 * Toggle like on a track
 */
export async function toggleTrackLike(userAddress: string, trackId: string) {
  // Check if like exists
  const { data: existingLike } = await supabase
    .from("likes")
    .select("id")
    .eq("user_address", userAddress)
    .eq("track_id", trackId)
    .single();

  if (existingLike) {
    // Unlike: Remove the like
    const { error } = await supabase
      .from("likes")
      .delete()
      .eq("user_address", userAddress)
      .eq("track_id", trackId);

    if (error) throw error;
    return { isLiked: false };
  } else {
    // Like: Add the like
    const { error } = await supabase.from("likes").insert({
      user_address: userAddress,
      track_id: trackId,
    });

    if (error) throw error;
    return { isLiked: true };
  }
}

/**
 * Get total likes for a track
 */
export async function getTrackLikes(trackId: string) {
  const { data, error, count } = await supabase
    .from("likes")
    .select("*", { count: "exact" })
    .eq("track_id", trackId);

  if (error) throw error;
  return { totalLikes: count || 0, likes: data || [] };
}

/**
 * Check if user liked a track
 */
export async function isTrackLiked(userAddress: string, trackId: string) {
  const { data, error } = await supabase
    .from("likes")
    .select("id")
    .eq("user_address", userAddress)
    .eq("track_id", trackId)
    .single();

  if (error && error.code !== "PGRST116") throw error; // PGRST116 = no rows
  return { isLiked: !!data };
}

/**
 * Add comment to a track
 */
export async function addTrackComment(
  userAddress: string,
  trackId: string,
  content: string
) {
  const { data, error } = await supabase
    .from("comments")
    .insert({
      user_address: userAddress,
      track_id: trackId,
      content,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get comments for a track
 */
export async function getTrackComments(trackId: string) {
  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .eq("track_id", trackId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data || [];
}

/**
 * Get user's liked tracks
 */
export async function getUserLikedTracks(userAddress: string) {
  const { data, error } = await supabase
    .from("likes")
    .select("track_id")
    .eq("user_address", userAddress);

  if (error) throw error;
  return (data || []).map((like) => like.track_id);
}

// ==========================================
// USER PROFILE QUERIES
// ==========================================

/**
 * Get or create user profile
 */
export async function getUserProfile(address: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("address", address)
    .single();

  if (error && error.code === "PGRST116") {
    // Profile doesn't exist, create default one
    const { data: newProfile, error: insertError } = await supabase
      .from("profiles")
      .insert({
        address,
        display_name: `${address.substring(0, 6)}...${address.substring(
          address.length - 4
        )}`,
        verified: false,
      })
      .select()
      .single();

    if (insertError) throw insertError;
    return newProfile;
  }

  if (error) throw error;
  return data;
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  address: string,
  updates: {
    display_name?: string;
    bio?: string;
    avatar_url?: string;
  }
) {
  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("address", address)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ==========================================
// REAL-TIME SUBSCRIPTIONS
// ==========================================

/**
 * Subscribe to track likes changes
 */
export function subscribeToTrackLikes(
  trackId: string,
  callback: (payload: any) => void
) {
  return supabase
    .channel(`track-likes-${trackId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "likes",
        filter: `track_id=eq.${trackId}`,
      },
      callback
    )
    .subscribe();
}

/**
 * Subscribe to track comments changes
 */
export function subscribeToTrackComments(
  trackId: string,
  callback: (payload: any) => void
) {
  return supabase
    .channel(`track-comments-${trackId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "comments",
        filter: `track_id=eq.${trackId}`,
      },
      callback
    )
    .subscribe();
}
