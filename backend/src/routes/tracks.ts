import { zValidator } from "@hono/zod-validator"
import { Hono } from "hono"
import { z } from "zod"
import { supabase } from "../lib/supabase"

// Create router
const app = new Hono()

// Schema for track creation
const CreateTrackSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  genre: z.string().optional(),
  tags: z.array(z.string()).optional(),
  duration: z.string().optional(),
  artist_address: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address"),
  ipfs_hash: z.string().optional(),
  ipfs_url: z.string().url().optional(),
  file_hash: z.string().optional(),
  ip_id: z.string().optional(),
  verified: z.boolean().default(false),
  yakoa_token_id: z.string().optional(),
})

// Query schema for tracks
const TracksQuerySchema = z.object({
  tab: z.enum(["latest", "following", "trending"]).optional().default("latest"),
  user_address: z.string().optional(), // For following tab functionality
  genre: z.string().optional(), // For genre filtering
  limit: z.coerce.number().min(1).max(50).optional().default(20),
  offset: z.coerce.number().min(0).optional().default(0),
})

/**
 * Create a new track
 */
app.post("/", zValidator("json", CreateTrackSchema), async (c) => {
  try {
    const trackData = c.req.valid("json")

    // Get artist profile to populate artist_name
    const { data: artistProfile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("address", trackData.artist_address)
      .single()

    // Insert track into Supabase
    const { data: track, error } = await supabase
      .from("tracks")
      .insert({
        title: trackData.title,
        description: trackData.description,
        genre: trackData.genre,
        tags: trackData.tags,
        duration: trackData.duration,
        artist_address: trackData.artist_address,
        artist_name: artistProfile?.display_name || null, // Populate from profile
        ipfs_hash: trackData.ipfs_hash,
        ipfs_url: trackData.ipfs_url,
        file_hash: trackData.file_hash,
        ip_id: trackData.ip_id,
        verified: trackData.verified,
        yakoa_token_id: trackData.yakoa_token_id,
        plays: 0,
        likes_count: 0,
        comments_count: 0,
      })
      .select()
      .single()

    if (error) {
      console.error("Track creation error:", error)
      return c.json(
        {
          success: false,
          error: error.message,
        },
        500,
      )
    }

    return c.json({
      success: true,
      data: track,
    })
  } catch (error: any) {
    console.error("Create track error:", error)
    return c.json(
      {
        success: false,
        error: error.message,
      },
      500,
    )
  }
})

/**
 * Get tracks for discovery feed
 */
app.get("/", zValidator("query", TracksQuerySchema), async (c) => {
  try {
    const { tab, user_address, genre, limit, offset } = c.req.valid("query")

    // Build base query - we'll join profiles manually
    let baseQuery = supabase.from("tracks").select("*")

    // Apply genre filter if specified
    if (genre) {
      baseQuery = baseQuery.eq("genre", genre)
    }

    let { data: tracksData, error } = await baseQuery
      .range(offset, offset + limit - 1)
      .order("created_at", { ascending: false })

    // Apply filtering based on tab
    if (tab === "following") {
      // For following tab, get tracks from creators the user follows
      if (!user_address) {
        // If no user address provided, return empty result
        tracksData = []
      } else {
        // First, get the list of creators this user follows
        const { data: followedCreators, error: followsError } = await supabase
          .from("follows")
          .select("following_address")
          .eq("follower_address", user_address)

        if (followsError) {
          console.error("Get follows error:", followsError)
          return c.json(
            {
              success: false,
              error: followsError.message,
            },
            500,
          )
        }

        const followedAddresses =
          followedCreators?.map((f) => f.following_address) || []

        if (followedAddresses.length === 0) {
          // User doesn't follow anyone, return empty result
          tracksData = []
        } else {
          // Get tracks from followed creators
          let followingQuery = supabase
            .from("tracks")
            .select("*")
            .in("artist_address", followedAddresses)

          // Apply genre filter if specified
          if (genre) {
            followingQuery = followingQuery.eq("genre", genre)
          }

          followingQuery = followingQuery
            .range(offset, offset + limit - 1)
            .order("created_at", { ascending: false })

          const { data: followingData, error: followingError } =
            await followingQuery
          if (followingError) {
            console.error("Get following tracks error:", followingError)
            return c.json(
              {
                success: false,
                error: followingError.message,
              },
              500,
            )
          }
          tracksData = followingData
        }
      }
    } else if (tab === "trending") {
      // For trending tab, order by plays descending (most played first)
      let trendingQuery = supabase.from("tracks").select("*")

      // Apply genre filter if specified
      if (genre) {
        trendingQuery = trendingQuery.eq("genre", genre)
      }

      // Order by a combined trending score: plays + (likes * 2) for better engagement weighting
      // This gives likes more weight since they're more intentional than plays
      trendingQuery = trendingQuery
        .range(offset, offset + limit - 1)
        .order("plays", { ascending: false })
        .order("likes_count", { ascending: false })

      const { data: trendingData, error: trendingError } = await trendingQuery
      if (trendingError) {
        console.error("Get trending tracks error:", trendingError)
        return c.json(
          {
            success: false,
            error: trendingError.message,
          },
          500,
        )
      }
      tracksData = trendingData
    }
    // For 'latest' tab, use the default query (already sorted by created_at DESC)

    if (error) {
      console.error("Get tracks error:", error)
      return c.json(
        {
          success: false,
          error: error.message,
        },
        500,
      )
    }

    // Get unique artist addresses to fetch profile data
    const artistAddresses = [
      ...new Set((tracksData || []).map((track) => track.artist_address)),
    ]

    // Fetch profile data for all artists
    const { data: profiles } = await supabase
      .from("profiles")
      .select("address, display_name, avatar_url, username")
      .in("address", artistAddresses)

    // Create a map for quick profile lookup
    const profileMap = new Map(profiles?.map((p) => [p.address, p]) || [])

    // Transform to match frontend expected format - simple approach
    const tracks = (tracksData || []).map((track) => {
      const profile = profileMap.get(track.artist_address)
      return {
        id: track.id,
        ipId: track.id,
        title: track.title,
        artist:
          track.artist_name ||
          profile?.display_name ||
          `${track.artist_address.substring(0, 6)}...${track.artist_address.substring(track.artist_address.length - 4)}`,
        artistAddress: track.artist_address,
        artistUsername: profile?.username, // Add username for navigation
        artistAvatarUrl: profile?.avatar_url,
        duration: track.duration || "0:00",
        plays: track.plays || 0,
        verified: track.verified || false,
        likes: track.likes_count || 0,
        comments: track.comments_count || 0,
        isLiked: false, // TODO: Check if current user liked this track
        imageUrl: track.ipfs_url || "",
        description: track.description,
        genre: track.genre,
        createdAt: track.created_at?.split("T")[0] || "",
      }
    })

    // Get total count for pagination
    const { count: totalCount } = await supabase
      .from("tracks")
      .select("*", { count: "exact", head: true })

    return c.json({
      success: true,
      data: {
        tracks,
        total: totalCount || 0,
        hasMore: offset + limit < (totalCount || 0),
      },
    })
  } catch (error: any) {
    console.error("Get tracks error:", error)
    return c.json(
      {
        success: false,
        error: error.message,
      },
      500,
    )
  }
})

/**
 * Get single track by ID
 */
app.get("/:id", async (c) => {
  try {
    const trackId = c.req.param("id")

    const { data: track, error } = await supabase
      .from("tracks")
      .select("*")
      .eq("id", trackId)
      .single()

    if (error || !track) {
      return c.json(
        {
          success: false,
          error: "Track not found",
        },
        404,
      )
    }

    // Get profile data for the artist
    const { data: profile } = await supabase
      .from("profiles")
      .select("address, display_name, avatar_url, username")
      .eq("address", track.artist_address)
      .single()

    // Transform to match frontend expected format - simple approach
    const transformedTrack = {
      id: track.id,
      ipId: track.ip_id || track.id,
      title: track.title,
      artist:
        track.artist_name ||
        profile?.display_name ||
        `${track.artist_address.substring(0, 6)}...${track.artist_address.substring(track.artist_address.length - 4)}`,
      artistAddress: track.artist_address,
      artistUsername: profile?.username, // Add username for navigation
      artistAvatarUrl: profile?.avatar_url,
      duration: track.duration || "0:00",
      plays: track.plays || 0,
      verified: track.verified || false,
      likes: track.likes_count || 0,
      comments: track.comments_count || 0,
      isLiked: false, // TODO: Check if current user liked this track
      imageUrl: track.ipfs_url || "",
      description: track.description,
      genre: track.genre,
      createdAt: track.created_at?.split("T")[0] || "",
    }

    return c.json({
      success: true,
      data: transformedTrack,
    })
  } catch (error: any) {
    console.error("Get track error:", error)
    return c.json(
      {
        success: false,
        error: error.message,
      },
      500,
    )
  }
})

/**
 * Get trending tracks for sidebar
 */
app.get("/trending/sidebar", async (c) => {
  try {
    const { data: tracksData, error } = await supabase
      .from("tracks")
      .select("*")
      .order("plays", { ascending: false })
      .limit(5)

    if (error) {
      console.error("Get trending tracks error:", error)
      return c.json(
        {
          success: false,
          error: error.message,
        },
        500,
      )
    }

    // Get unique artist addresses to fetch profile data
    const artistAddresses = [
      ...new Set((tracksData || []).map((track) => track.artist_address)),
    ]

    // Fetch profile data for all artists
    const { data: profiles } = await supabase
      .from("profiles")
      .select("address, display_name, avatar_url, username")
      .in("address", artistAddresses)

    // Create a map for quick profile lookup
    const profileMap = new Map(profiles?.map((p) => [p.address, p]) || [])

    // Transform to match frontend expected format - simple approach
    const tracks = (tracksData || []).map((track) => {
      const profile = profileMap.get(track.artist_address)
      return {
        id: track.id,
        ipId: track.id,
        title: track.title,
        artist:
          track.artist_name ||
          profile?.display_name ||
          `${track.artist_address.substring(0, 6)}...${track.artist_address.substring(track.artist_address.length - 4)}`,
        artistAddress: track.artist_address,
        artistUsername: profile?.username, // Add username for navigation
        artistAvatarUrl: profile?.avatar_url,
        duration: track.duration || "0:00",
        plays: track.plays || 0,
        verified: track.verified || false,
        likes: track.likes_count || 0,
        comments: track.comments_count || 0,
        isLiked: false,
        imageUrl: track.ipfs_url || "",
      }
    })

    return c.json({
      success: true,
      data: tracks,
    })
  } catch (error: any) {
    console.error("Get trending tracks error:", error)
    return c.json(
      {
        success: false,
        error: error.message,
      },
      500,
    )
  }
})

export default app
