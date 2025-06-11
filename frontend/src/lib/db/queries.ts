import { supabase } from "@/lib/supabase/client";
import type { LicenseTransaction, Profile, RevenueClaim, Track } from "./schemas";

// ==========================================
// TRACK QUERIES
// ==========================================

export const trackQueries = {
  /**
   * Get all tracks with pagination and filtering
   */
  getAll: async ({
    limit = 20,
    offset = 0,
    filter = "all",
    sortBy = "created_at",
  }: {
    limit?: number;
    offset?: number;
    filter?: "all" | "verified" | "trending";
    sortBy?: "created_at" | "plays" | "likes_count" | "trending";
  } = {}) => {
    let query = supabase
      .from("tracks")
      .select("*")
      .range(offset, offset + limit - 1);

    // Apply filters
    if (filter === "verified") {
      query = query.eq("verified", true);
    }

    // Apply sorting
    if (sortBy === "trending" || sortBy === "plays") {
      query = query.order("plays", { ascending: false });
    } else if (sortBy === "likes_count") {
      query = query.order("likes_count", { ascending: false });
    } else {
      query = query.order("created_at", { ascending: false });
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  /**
   * Get track by ID
   */
  getById: async (trackId: string) => {
    const { data, error } = await supabase.from("tracks").select("*").eq("id", trackId).single();

    if (error) throw error;
    return data;
  },

  /**
   * Get tracks by artist
   */
  getByArtist: async (artistAddress: string) => {
    const { data, error } = await supabase
      .from("tracks")
      .select("*")
      .eq("artist_address", artistAddress)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Create new track
   */
  create: async (trackData: Partial<Track>) => {
    const { data, error } = await supabase.from("tracks").insert(trackData).select().single();

    if (error) throw error;
    return data;
  },

  /**
   * Update track
   */
  update: async (trackId: string, updates: Partial<Track>) => {
    const { data, error } = await supabase
      .from("tracks")
      .update(updates)
      .eq("id", trackId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Increment track plays
   */
  incrementPlays: async (trackId: string) => {
    const { error } = await supabase.rpc("increment_track_plays", {
      track_id: trackId,
    });

    if (error) throw error;
  },
};

// ==========================================
// SOCIAL QUERIES
// ==========================================

export const socialQueries = {
  likes: {
    /**
     * Toggle like on a track
     */
    toggle: async (userAddress: string, trackId: string) => {
      // Check if like exists
      const { data: existingLike } = await supabase
        .from("likes")
        .select("id")
        .eq("user_address", userAddress)
        .eq("track_id", trackId)
        .single();

      if (existingLike) {
        // Unlike: Remove the like and decrement count
        const { error } = await supabase
          .from("likes")
          .delete()
          .eq("user_address", userAddress)
          .eq("track_id", trackId);

        if (error) throw error;

        // Decrement likes count
        await supabase.rpc("decrement_track_likes", { track_id: trackId });

        return { isLiked: false };
      } else {
        // Like: Add the like and increment count
        const { error } = await supabase.from("likes").insert({
          user_address: userAddress,
          track_id: trackId,
        });

        if (error) throw error;

        // Increment likes count
        await supabase.rpc("increment_track_likes", { track_id: trackId });

        return { isLiked: true };
      }
    },

    /**
     * Get total likes for a track
     */
    getForTrack: async (trackId: string) => {
      const { data, error, count } = await supabase
        .from("likes")
        .select("*", { count: "exact" })
        .eq("track_id", trackId);

      if (error) throw error;
      return { totalLikes: count || 0, likes: data || [] };
    },

    /**
     * Check if user liked a track
     */
    isLiked: async (userAddress: string, trackId: string) => {
      const { data, error } = await supabase
        .from("likes")
        .select("id")
        .eq("user_address", userAddress)
        .eq("track_id", trackId)
        .single();

      if (error && error.code !== "PGRST116") throw error; // PGRST116 = no rows
      return { isLiked: !!data };
    },

    /**
     * Get user's liked tracks
     */
    getUserLiked: async (userAddress: string) => {
      const { data, error } = await supabase
        .from("likes")
        .select(
          `
          track_id,
          tracks:track_id (*)
        `,
        )
        .eq("user_address", userAddress);

      if (error) throw error;
      return data || [];
    },
  },

  comments: {
    /**
     * Add comment to a track
     */
    add: async (userAddress: string, trackId: string, content: string) => {
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

      // Increment comments count
      await supabase.rpc("increment_track_comments", { track_id: trackId });

      return data;
    },

    /**
     * Get comments for a track
     */
    getForTrack: async (trackId: string) => {
      const { data, error } = await supabase
        .from("comments")
        .select("*")
        .eq("track_id", trackId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data || [];
    },
  },

  follows: {
    /**
     * Follow/unfollow user
     */
    toggle: async (followerAddress: string, followingAddress: string) => {
      // Check if follow exists
      const { data: existingFollow } = await supabase
        .from("follows")
        .select("id")
        .eq("follower_address", followerAddress)
        .eq("following_address", followingAddress)
        .single();

      if (existingFollow) {
        // Unfollow
        const { error } = await supabase
          .from("follows")
          .delete()
          .eq("follower_address", followerAddress)
          .eq("following_address", followingAddress);

        if (error) throw error;
        return { isFollowing: false };
      } else {
        // Follow
        const { error } = await supabase.from("follows").insert({
          follower_address: followerAddress,
          following_address: followingAddress,
        });

        if (error) throw error;
        return { isFollowing: true };
      }
    },

    /**
     * Get user's followers
     */
    getFollowers: async (userAddress: string) => {
      const { data, error } = await supabase
        .from("follows")
        .select("follower_address")
        .eq("following_address", userAddress);

      if (error) throw error;
      return data || [];
    },

    /**
     * Get user's following
     */
    getFollowing: async (userAddress: string) => {
      const { data, error } = await supabase
        .from("follows")
        .select("following_address")
        .eq("follower_address", userAddress);

      if (error) throw error;
      return data || [];
    },

    /**
     * Check if user is following another user
     */
    isFollowing: async (followerAddress: string, followingAddress: string): Promise<boolean> => {
      const { data, error } = await supabase
        .from("follows")
        .select("id")
        .eq("follower_address", followerAddress)
        .eq("following_address", followingAddress)
        .single();

      if (error && error.code === "PGRST116") {
        return false; // No follow relationship found
      }

      if (error) throw error;
      return !!data;
    },
  },
};

// ==========================================
// LICENSING & MONETIZATION QUERIES
// ==========================================

export const monetizationQueries = {
  licenses: {
    /**
     * Record license transaction
     */
    record: async (transaction: Omit<LicenseTransaction, "id" | "created_at">) => {
      const { data, error } = await supabase
        .from("license_transactions")
        .insert(transaction)
        .select()
        .single();

      if (error) throw error;

      // Increment total licenses sold for track
      await supabase.rpc("increment_track_licenses_sold", {
        track_id: transaction.track_id,
      });

      return data;
    },

    /**
     * Get license transactions for a track
     */
    getForTrack: async (trackId: string) => {
      const { data, error } = await supabase
        .from("license_transactions")
        .select("*")
        .eq("track_id", trackId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },

    /**
     * Get user's license purchases
     */
    getForUser: async (userAddress: string) => {
      const { data, error } = await supabase
        .from("license_transactions")
        .select(
          `
          *,
          tracks:track_id (*)
        `,
        )
        .eq("buyer_address", userAddress)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  },

  revenue: {
    /**
     * Record revenue claim
     */
    record: async (claim: Omit<RevenueClaim, "id" | "created_at">) => {
      const { data, error } = await supabase.from("revenue_claims").insert(claim).select().single();

      if (error) throw error;

      // Update track's total revenue earned
      if (claim.track_id) {
        await supabase.rpc("add_track_revenue", {
          track_id: claim.track_id,
          amount: claim.amount_claimed,
        });
      }

      return data;
    },

    /**
     * Get revenue claims for a creator
     */
    getForCreator: async (creatorAddress: string) => {
      const { data, error } = await supabase
        .from("revenue_claims")
        .select("*")
        .eq("creator_address", creatorAddress)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  },
};

// ==========================================
// USER PROFILE QUERIES
// ==========================================

export const profileQueries = {
  /**
   * Get or create user profile
   */
  getOrCreate: async (address: string): Promise<Profile> => {
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
          display_name: `${address.substring(0, 6)}...${address.substring(address.length - 4)}`,
          verified: false,
        })
        .select()
        .single();

      if (insertError) throw insertError;
      return newProfile;
    }

    if (error) throw error;
    return data;
  },

  /**
   * Get profile by username or address
   */
  getByIdentifier: async (identifier: string): Promise<Profile | null> => {
    // Check if identifier looks like an Ethereum address
    const isAddress = /^0x[a-fA-F0-9]{40}$/.test(identifier);

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq(isAddress ? "address" : "username", identifier)
      .single();

    if (error && error.code === "PGRST116") {
      return null; // Profile not found
    }

    if (error) throw error;
    return data;
  },

  /**
   * Check if username is available
   */
  checkUsernameAvailability: async (username: string): Promise<{ available: boolean }> => {
    const { data, error } = await supabase
      .from("profiles")
      .select("username")
      .eq("username", username)
      .single();

    if (error && error.code === "PGRST116") {
      return { available: true }; // Username not found, so it's available
    }

    if (error) throw error;
    return { available: false }; // Username exists
  },

  /**
   * Update user profile
   */
  update: async (
    address: string,
    updates: {
      username?: string;
      display_name?: string;
      avatar_url?: string;
    },
  ) => {
    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("address", address)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Search users by username or display name
   */
  search: async (query: string, limit = 10): Promise<Profile[]> => {
    if (!query.trim()) return [];

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .or(`username.ilike.%${query}%,display_name.ilike.%${query}%,address.ilike.%${query}%`)
      .limit(limit)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },
};

// ==========================================
// REAL-TIME SUBSCRIPTIONS
// ==========================================

export const subscriptions = {
  /**
   * Subscribe to track likes changes
   */
  trackLikes: (trackId: string, callback: (payload: any) => void) => {
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
        callback,
      )
      .subscribe();
  },

  /**
   * Subscribe to track comments changes
   */
  trackComments: (trackId: string, callback: (payload: any) => void) => {
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
        callback,
      )
      .subscribe();
  },
};
