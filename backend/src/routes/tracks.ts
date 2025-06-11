import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { supabase } from '../lib/supabase'

// Create router
const app = new Hono()

// Schema for track creation
const CreateTrackSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    genre: z.string().optional(),
    tags: z.array(z.string()).optional(),
    duration: z.string().optional(),
    artist_address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address'),
    ipfs_hash: z.string().optional(),
    ipfs_url: z.string().url().optional(),
    file_hash: z.string().optional(),
    ip_id: z.string().optional(),
    verified: z.boolean().default(false),
    yakoa_token_id: z.string().optional(),
})

// Query schema for tracks
const TracksQuerySchema = z.object({
    tab: z.enum(['following', 'verified', 'trending']).optional().default('following'),
    limit: z.coerce.number().min(1).max(50).optional().default(20),
    offset: z.coerce.number().min(0).optional().default(0),
})

/**
 * Create a new track
 */
app.post('/', zValidator('json', CreateTrackSchema), async (c) => {
    try {
        const trackData = c.req.valid('json')

        // Insert track into Supabase
        const { data: track, error } = await supabase
            .from('tracks')
            .insert({
                title: trackData.title,
                description: trackData.description,
                genre: trackData.genre,
                tags: trackData.tags,
                duration: trackData.duration,
                artist_address: trackData.artist_address,
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
            console.error('Track creation error:', error)
            return c.json(
                {
                    success: false,
                    error: error.message,
                },
                500
            )
        }

        return c.json({
            success: true,
            data: track,
        })
    } catch (error: any) {
        console.error('Create track error:', error)
        return c.json(
            {
                success: false,
                error: error.message,
            },
            500
        )
    }
})

/**
 * Get tracks for discovery feed
 */
app.get('/', zValidator('query', TracksQuerySchema), async (c) => {
    try {
        const { tab, limit, offset } = c.req.valid('query')

        // Build query based on tab filter
        let query = supabase
            .from('tracks')
            .select(
                `
                id,
                title,
                description,
                genre,
                duration,
                artist_address,
                verified,
                plays,
                likes_count,
                comments_count,
                ipfs_url,
                created_at
            `
            )
            .range(offset, offset + limit - 1)

        // Apply filtering based on tab
        switch (tab) {
            case 'verified':
                query = query.eq('verified', true)
                break
            case 'trending':
                query = query.order('plays', { ascending: false })
                break
            case 'following':
                // For now, return all tracks ordered by creation date
                query = query.order('created_at', { ascending: false })
                break
        }

        // For non-trending, default sort by creation date
        if (tab !== 'trending') {
            query = query.order('created_at', { ascending: false })
        }

        const { data: tracksData, error } = await query

        if (error) {
            console.error('Get tracks error:', error)
            return c.json(
                {
                    success: false,
                    error: error.message,
                },
                500
            )
        }

        // Transform to match frontend expected format
        const tracks = (tracksData || []).map((track) => ({
            id: track.id,
            ipId: track.id, // Using track ID as ipId for now
            title: track.title,
            artist: `${track.artist_address.substring(0, 6)}...${track.artist_address.substring(track.artist_address.length - 4)}`,
            artistAddress: track.artist_address,
            duration: track.duration || '0:00',
            plays: track.plays || 0,
            verified: track.verified || false,
            likes: track.likes_count || 0,
            comments: track.comments_count || 0,
            isLiked: false, // TODO: Check if current user liked this track
            imageUrl: track.ipfs_url || '',
            description: track.description,
            genre: track.genre,
            createdAt: track.created_at?.split('T')[0] || '',
        }))

        // Get total count for pagination
        const { count: totalCount } = await supabase.from('tracks').select('*', { count: 'exact', head: true })

        return c.json({
            success: true,
            data: {
                tracks,
                total: totalCount || 0,
                hasMore: offset + limit < (totalCount || 0),
            },
        })
    } catch (error: any) {
        console.error('Get tracks error:', error)
        return c.json(
            {
                success: false,
                error: error.message,
            },
            500
        )
    }
})

/**
 * Get single track by ID
 */
app.get('/:id', async (c) => {
    try {
        const trackId = c.req.param('id')

        const { data: track, error } = await supabase.from('tracks').select('*').eq('id', trackId).single()

        if (error || !track) {
            return c.json(
                {
                    success: false,
                    error: 'Track not found',
                },
                404
            )
        }

        // Transform to match frontend expected format
        const transformedTrack = {
            id: track.id,
            ipId: track.ip_id || track.id,
            title: track.title,
            artist: `${track.artist_address.substring(0, 6)}...${track.artist_address.substring(track.artist_address.length - 4)}`,
            artistAddress: track.artist_address,
            duration: track.duration || '0:00',
            plays: track.plays || 0,
            verified: track.verified || false,
            likes: track.likes_count || 0,
            comments: track.comments_count || 0,
            isLiked: false, // TODO: Check if current user liked this track
            imageUrl: track.ipfs_url || '',
            description: track.description,
            genre: track.genre,
            createdAt: track.created_at?.split('T')[0] || '',
        }

        return c.json({
            success: true,
            data: transformedTrack,
        })
    } catch (error: any) {
        console.error('Get track error:', error)
        return c.json(
            {
                success: false,
                error: error.message,
            },
            500
        )
    }
})

/**
 * Get trending tracks for sidebar
 */
app.get('/trending/sidebar', async (c) => {
    try {
        const { data: tracksData, error } = await supabase
            .from('tracks')
            .select(
                `
                id,
                title,
                artist_address,
                duration,
                plays,
                verified,
                likes_count,
                comments_count,
                ipfs_url
            `
            )
            .order('plays', { ascending: false })
            .limit(5)

        if (error) {
            console.error('Get trending tracks error:', error)
            return c.json(
                {
                    success: false,
                    error: error.message,
                },
                500
            )
        }

        // Transform to match frontend expected format
        const tracks = (tracksData || []).map((track) => ({
            id: track.id,
            ipId: track.id,
            title: track.title,
            artist: `${track.artist_address.substring(0, 6)}...${track.artist_address.substring(track.artist_address.length - 4)}`,
            artistAddress: track.artist_address,
            duration: track.duration || '0:00',
            plays: track.plays || 0,
            verified: track.verified || false,
            likes: track.likes_count || 0,
            comments: track.comments_count || 0,
            isLiked: false,
            imageUrl: track.ipfs_url || '',
        }))

        return c.json({
            success: true,
            data: tracks,
        })
    } catch (error: any) {
        console.error('Get trending tracks error:', error)
        return c.json(
            {
                success: false,
                error: error.message,
            },
            500
        )
    }
})

export default app
