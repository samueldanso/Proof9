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

// Mock data for now - will integrate with Story Protocol queries later
const mockTracks = [
    {
        id: '1',
        ipId: '0x1234567890123456789012345678901234567890',
        title: 'Summer Vibes',
        artist: '0xE89f...2455',
        artistAddress: '0xE89fEf221bdEd027C4c9F07D256b9Dc1422A2455',
        duration: '3:24',
        plays: 1250,
        verified: true,
        likes: 89,
        comments: 12,
        isLiked: false,
        imageUrl: '',
        description: 'A chill summer track perfect for relaxing by the beach.',
        genre: 'Electronic',
        createdAt: '2024-01-15',
    },
    {
        id: '2',
        ipId: '0x2345678901234567890123456789012345678901',
        title: 'Midnight Dreams',
        artist: '0xA1B2...3456',
        artistAddress: '0xA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0',
        duration: '4:12',
        plays: 892,
        verified: true,
        likes: 64,
        comments: 8,
        isLiked: true,
        imageUrl: '',
        description: 'Atmospheric electronic soundscape.',
        genre: 'Ambient',
        createdAt: '2024-01-10',
    },
]

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
                likes: 0,
                comments: 0,
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

        let filteredTracks = [...mockTracks]

        // Apply filtering based on tab
        switch (tab) {
            case 'verified':
                filteredTracks = filteredTracks.filter((track) => track.verified)
                break
            case 'trending':
                filteredTracks = filteredTracks.sort((a, b) => b.plays - a.plays)
                break
            case 'following':
                // For now, return all tracks
                break
        }

        // Apply pagination
        const paginatedTracks = filteredTracks.slice(offset, offset + limit)

        return c.json({
            success: true,
            data: {
                tracks: paginatedTracks,
                total: filteredTracks.length,
                hasMore: offset + limit < filteredTracks.length,
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
        const track = mockTracks.find((t) => t.id === trackId)

        if (!track) {
            return c.json(
                {
                    success: false,
                    error: 'Track not found',
                },
                404
            )
        }

        return c.json({
            success: true,
            data: track,
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
        const trendingTracks = [...mockTracks].sort((a, b) => b.plays - a.plays).slice(0, 5)

        return c.json({
            success: true,
            data: trendingTracks,
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
