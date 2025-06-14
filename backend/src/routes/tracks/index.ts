import { zValidator } from "@hono/zod-validator"
import { Hono } from "hono"
import { z } from "zod"
import { supabase } from "../../lib/supabase"

// Create router
const tracksRouter = new Hono()

// Story Protocol Track Creation Schema - EXACT NAMING ONLY
const CreateTrackSchema = z.object({
  // Story Protocol IPA Standard
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  creators: z.array(
    z.object({
      name: z.string(),
      address: z.string(),
      contributionPercent: z.number(),
      description: z.string().optional(),
      socialMedia: z
        .array(
          z.object({
            platform: z.string(),
            url: z.string(),
          }),
        )
        .optional(),
    }),
  ),

  // Story Protocol image.* fields
  image: z.string().url().optional(),
  imageHash: z.string().optional(),

  // Story Protocol media.* fields
  mediaUrl: z.string().url().optional(),
  mediaHash: z.string().optional(),
  mediaType: z.string().optional(),

  // Additional metadata
  genre: z.string().optional(),
  tags: z.array(z.string()).optional(),
  duration: z.string().optional(),

  // Story Protocol data
  ipId: z.string().optional(),
  tokenId: z.string().optional(),
  transactionHash: z.string().optional(),
  licenseTermsIds: z.array(z.string()).optional(),

  // Verification
  verified: z.boolean().default(false),
  yakoaTokenId: z.string().optional(),

  // IPFS metadata
  metadataIpfsHash: z.string().optional(),
  metadataIpfsUrl: z.string().optional(),
  nftMetadataIpfsHash: z.string().optional(),
  nftMetadataIpfsUrl: z.string().optional(),
  ipMetadataHash: z.string().optional(),
  nftMetadataHash: z.string().optional(),
})

// Query schema for tracks
const TracksQuerySchema = z.object({
  tab: z.enum(["latest", "following", "trending"]).optional().default("latest"),
  user_address: z.string().optional(),
  genre: z.string().optional(),
  limit: z.coerce.number().min(1).max(50).optional().default(20),
  offset: z.coerce.number().min(0).optional().default(0),
})

/**
 * Create a new track - Story Protocol format
 */
tracksRouter.post("/", zValidator("json", CreateTrackSchema), async (c) => {
  try {
    const trackData = c.req.valid("json")

    // Get primary creator's profile for fallback display name
    const primaryCreator = trackData.creators[0]
    const { data: creatorProfile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("address", primaryCreator.address)
      .single()

    // Insert track into Supabase using Story Protocol naming
    const { data: track, error } = await supabase
      .from("tracks")
      .insert({
        // Story Protocol IPA Standard
        title: trackData.title,
        description: trackData.description,
        creators: trackData.creators,

        // Story Protocol image.* fields
        image: trackData.image,
        imageHash: trackData.imageHash,

        // Story Protocol media.* fields
        mediaUrl: trackData.mediaUrl,
        mediaHash: trackData.mediaHash,
        mediaType: trackData.mediaType,

        // Additional metadata
        genre: trackData.genre,
        tags: trackData.tags,
        duration: trackData.duration,

        // Story Protocol data
        ip_id: trackData.ipId,
        token_id: trackData.tokenId,
        transaction_hash: trackData.transactionHash,
        license_terms_ids: trackData.licenseTermsIds,

        // Verification
        verified: trackData.verified,
        yakoa_token_id: trackData.yakoaTokenId,

        // IPFS metadata
        metadata_ipfs_hash: trackData.metadataIpfsHash,
        metadata_ipfs_url: trackData.metadataIpfsUrl,
        nft_metadata_ipfs_hash: trackData.nftMetadataIpfsHash,
        nft_metadata_ipfs_url: trackData.nftMetadataIpfsUrl,
        ip_metadata_hash: trackData.ipMetadataHash,
        nft_metadata_hash: trackData.nftMetadataHash,

        // Legacy fields for DB compatibility (will be removed in migration)
        artist_address: primaryCreator.address,
        artist_name: primaryCreator.name || creatorProfile?.display_name,
        ipfs_url: trackData.mediaUrl, // Temporary mapping
        image_url: trackData.image, // Temporary mapping

        // Initialize social stats
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
 * Get tracks for discovery feed - STORY PROTOCOL FORMAT ONLY
 */
tracksRouter.get("/", zValidator("query", TracksQuerySchema), async (c) => {
  try {
    const { tab, user_address, genre, limit, offset } = c.req.valid("query")

    // Build base query
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
      if (!user_address) {
        tracksData = []
      } else {
        // Get tracks from followed creators
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
          tracksData = []
        } else {
          let followingQuery = supabase
            .from("tracks")
            .select("*")
            .in("artist_address", followedAddresses) // Using legacy field temporarily

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
      let trendingQuery = supabase.from("tracks").select("*")

      if (genre) {
        trendingQuery = trendingQuery.eq("genre", genre)
      }

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

    // Get unique creator addresses to fetch profile data
    const creatorAddresses = [
      ...new Set((tracksData || []).map((track) => track.artist_address)),
    ]

    // Fetch profile data for all creators
    const { data: profiles } = await supabase
      .from("profiles")
      .select("address, display_name, avatar_url, username")
      .in("address", creatorAddresses)

    // Create a map for quick profile lookup
    const profileMap = new Map(profiles?.map((p) => [p.address, p]) || [])

    // Transform to EXACT STORY PROTOCOL FORMAT ONLY
    const tracks = (tracksData || []).map((track) => {
      const primaryCreatorAddress = track.artist_address // Legacy field temporarily
      const profile = profileMap.get(primaryCreatorAddress)

      return {
        // Story Protocol IPA Standard
        id: track.id,
        title: track.title,
        description: track.description,
        creators: track.creators || [
          {
            name:
              track.artist_name ||
              profile?.display_name ||
              `${primaryCreatorAddress.substring(0, 6)}...${primaryCreatorAddress.substring(primaryCreatorAddress.length - 4)}`,
            address: primaryCreatorAddress,
            contributionPercent: 100,
          },
        ],

        // Story Protocol image.* fields
        image: track.image || track.image_url, // Fallback during migration
        imageHash: track.imageHash || track.image_hash,

        // Story Protocol media.* fields
        mediaUrl: track.mediaUrl || track.ipfs_url, // Fallback during migration
        mediaHash: track.mediaHash || track.media_hash,
        mediaType: track.mediaType || "audio/mpeg",

        // Additional metadata
        genre: track.genre,
        tags: track.tags || [],
        duration: track.duration || "0:00",

        // Social stats
        plays: track.plays || 0,
        likes: track.likes_count || 0,
        comments: track.comments_count || 0,

        // Story Protocol data
        ipId: track.ip_id,
        tokenId: track.token_id,
        transactionHash: track.transaction_hash,
        licenseTermsIds: track.license_terms_ids || [],

        // Verification
        verified: track.verified || false,
        yakoaTokenId: track.yakoa_token_id,

        // Timestamps
        createdAt: track.created_at,

        // Profile data for UI (social features)
        creatorUsername: profile?.username,
        creatorAvatarUrl: profile?.avatar_url,
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
 * Get single track by ID - STORY PROTOCOL FORMAT ONLY
 */
tracksRouter.get("/:id", async (c) => {
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

    // Get profile data for the primary creator
    const primaryCreatorAddress = track.artist_address // Legacy field temporarily
    const { data: profile } = await supabase
      .from("profiles")
      .select("address, display_name, avatar_url, username")
      .eq("address", primaryCreatorAddress)
      .single()

    // Transform to EXACT STORY PROTOCOL FORMAT ONLY
    const transformedTrack = {
      // Story Protocol IPA Standard
      id: track.id,
      title: track.title,
      description: track.description,
      creators: track.creators || [
        {
          name:
            track.artist_name ||
            profile?.display_name ||
            `${primaryCreatorAddress.substring(0, 6)}...${primaryCreatorAddress.substring(primaryCreatorAddress.length - 4)}`,
          address: primaryCreatorAddress,
          contributionPercent: 100,
        },
      ],

      // Story Protocol image.* fields
      image: track.image || track.image_url, // Fallback during migration
      imageHash: track.imageHash || track.image_hash,

      // Story Protocol media.* fields
      mediaUrl: track.mediaUrl || track.ipfs_url, // Fallback during migration
      mediaHash: track.mediaHash || track.media_hash,
      mediaType: track.mediaType || "audio/mpeg",

      // Additional metadata
      genre: track.genre,
      tags: track.tags || [],
      duration: track.duration || "0:00",

      // Social stats
      plays: track.plays || 0,
      likes: track.likes_count || 0,
      comments: track.comments_count || 0,

      // Story Protocol data
      ipId: track.ip_id,
      tokenId: track.token_id,
      transactionHash: track.transaction_hash,
      licenseTermsIds: track.license_terms_ids || [],

      // Verification
      verified: track.verified || false,
      yakoaTokenId: track.yakoa_token_id,

      // Timestamps
      createdAt: track.created_at,

      // Profile data for UI (social features)
      creatorUsername: profile?.username,
      creatorAvatarUrl: profile?.avatar_url,
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
 * Get trending tracks for sidebar - STORY PROTOCOL FORMAT ONLY
 */
tracksRouter.get("/trending/sidebar", async (c) => {
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

    // Get unique creator addresses to fetch profile data
    const creatorAddresses = [
      ...new Set((tracksData || []).map((track) => track.artist_address)),
    ]

    // Fetch profile data for all creators
    const { data: profiles } = await supabase
      .from("profiles")
      .select("address, display_name, avatar_url, username")
      .in("address", creatorAddresses)

    // Create a map for quick profile lookup
    const profileMap = new Map(profiles?.map((p) => [p.address, p]) || [])

    // Transform to EXACT STORY PROTOCOL FORMAT ONLY
    const tracks = (tracksData || []).map((track) => {
      const primaryCreatorAddress = track.artist_address // Legacy field temporarily
      const profile = profileMap.get(primaryCreatorAddress)
      const primaryCreator = track.creators?.[0] || {
        name:
          track.artist_name ||
          profile?.display_name ||
          `${primaryCreatorAddress.substring(0, 6)}...${primaryCreatorAddress.substring(primaryCreatorAddress.length - 4)}`,
        address: primaryCreatorAddress,
        contributionPercent: 100,
      }

      return {
        // Story Protocol IPA Standard
        id: track.id,
        title: track.title,
        description: track.description,
        creators: [primaryCreator],

        // Story Protocol image.* fields
        image: track.image || track.image_url, // Fallback during migration
        imageHash: track.imageHash || track.image_hash,

        // Story Protocol media.* fields
        mediaUrl: track.mediaUrl || track.ipfs_url, // Fallback during migration
        mediaHash: track.mediaHash || track.media_hash,
        mediaType: track.mediaType || "audio/mpeg",

        // Additional metadata
        genre: track.genre,
        tags: track.tags || [],
        duration: track.duration || "0:00",

        // Social stats
        plays: track.plays || 0,
        likes: track.likes_count || 0,
        comments: track.comments_count || 0,

        // Story Protocol data
        ipId: track.ip_id,
        tokenId: track.token_id,
        transactionHash: track.transaction_hash,
        licenseTermsIds: track.license_terms_ids || [],

        // Verification
        verified: track.verified || false,
        yakoaTokenId: track.yakoa_token_id,

        // Timestamps
        createdAt: track.created_at,

        // Profile data for UI (social features)
        creatorUsername: profile?.username,
        creatorAvatarUrl: profile?.avatar_url,
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

export { tracksRouter }
