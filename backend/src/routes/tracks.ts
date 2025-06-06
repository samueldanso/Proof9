import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'

// Create router
const app = new Hono()

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
