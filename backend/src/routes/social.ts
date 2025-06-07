import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'

// Create router
const app = new Hono()

// Validation schemas
const LikeToggleSchema = z.object({
    userAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
    trackId: z.string(),
})

const CommentSchema = z.object({
    userAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
    trackId: z.string(),
    content: z.string().min(1).max(500),
})

const UserSocialSchema = z.object({
    userAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
})

// In-memory storage for hackathon (will switch to Supabase)
const likes = new Map<string, Set<string>>() // trackId -> Set of userAddresses
const comments = new Map<string, Array<{ id: string; userAddress: string; content: string; createdAt: string }>>()
const userProfiles = new Map<string, { avatar?: string; bio?: string; displayName?: string }>()

/**
 * Toggle like on a track
 */
app.post('/like', zValidator('json', LikeToggleSchema), async (c) => {
    try {
        const { userAddress, trackId } = c.req.valid('json')

        if (!likes.has(trackId)) {
            likes.set(trackId, new Set())
        }

        const trackLikes = likes.get(trackId)!
        const wasLiked = trackLikes.has(userAddress)

        if (wasLiked) {
            trackLikes.delete(userAddress)
        } else {
            trackLikes.add(userAddress)
        }

        return c.json({
            success: true,
            data: {
                isLiked: !wasLiked,
                totalLikes: trackLikes.size,
            },
        })
    } catch (error: any) {
        console.error('Like toggle error:', error)
        return c.json({ success: false, error: error.message }, 500)
    }
})

/**
 * Get likes for a track
 */
app.get('/likes/:trackId', async (c) => {
    try {
        const trackId = c.req.param('trackId')
        const trackLikes = likes.get(trackId) || new Set()

        return c.json({
            success: true,
            data: {
                totalLikes: trackLikes.size,
                likedBy: Array.from(trackLikes),
            },
        })
    } catch (error: any) {
        console.error('Get likes error:', error)
        return c.json({ success: false, error: error.message }, 500)
    }
})

/**
 * Check if user liked a track
 */
app.get('/likes/:trackId/:userAddress', async (c) => {
    try {
        const trackId = c.req.param('trackId')
        const userAddress = c.req.param('userAddress')

        const trackLikes = likes.get(trackId) || new Set()
        const isLiked = trackLikes.has(userAddress)

        return c.json({
            success: true,
            data: { isLiked },
        })
    } catch (error: any) {
        console.error('Check like error:', error)
        return c.json({ success: false, error: error.message }, 500)
    }
})

/**
 * Add comment to a track
 */
app.post('/comment', zValidator('json', CommentSchema), async (c) => {
    try {
        const { userAddress, trackId, content } = c.req.valid('json')

        if (!comments.has(trackId)) {
            comments.set(trackId, [])
        }

        const comment = {
            id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            userAddress,
            content,
            createdAt: new Date().toISOString(),
        }

        comments.get(trackId)!.push(comment)

        return c.json({
            success: true,
            data: comment,
        })
    } catch (error: any) {
        console.error('Add comment error:', error)
        return c.json({ success: false, error: error.message }, 500)
    }
})

/**
 * Get comments for a track
 */
app.get('/comments/:trackId', async (c) => {
    try {
        const trackId = c.req.param('trackId')
        const trackComments = comments.get(trackId) || []

        return c.json({
            success: true,
            data: {
                comments: trackComments,
                total: trackComments.length,
            },
        })
    } catch (error: any) {
        console.error('Get comments error:', error)
        return c.json({ success: false, error: error.message }, 500)
    }
})

/**
 * Get user's liked tracks
 */
app.get('/user/:userAddress/likes', async (c) => {
    try {
        const userAddress = c.req.param('userAddress')
        const likedTracks: string[] = []

        // Find all tracks this user liked
        for (const [trackId, userSet] of likes.entries()) {
            if (userSet.has(userAddress)) {
                likedTracks.push(trackId)
            }
        }

        return c.json({
            success: true,
            data: {
                likedTracks,
                total: likedTracks.length,
            },
        })
    } catch (error: any) {
        console.error('Get user likes error:', error)
        return c.json({ success: false, error: error.message }, 500)
    }
})

/**
 * Update user profile
 */
app.put(
    '/profile',
    zValidator(
        'json',
        z.object({
            userAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
            displayName: z.string().optional(),
            bio: z.string().max(160).optional(),
            avatar: z.string().url().optional(),
        })
    ),
    async (c) => {
        try {
            const { userAddress, ...profileData } = c.req.valid('json')

            if (!userProfiles.has(userAddress)) {
                userProfiles.set(userAddress, {})
            }

            const profile = userProfiles.get(userAddress)!
            Object.assign(profile, profileData)

            return c.json({
                success: true,
                data: profile,
            })
        } catch (error: any) {
            console.error('Update profile error:', error)
            return c.json({ success: false, error: error.message }, 500)
        }
    }
)

/**
 * Get user profile
 */
app.get('/profile/:userAddress', async (c) => {
    try {
        const userAddress = c.req.param('userAddress')
        const profile = userProfiles.get(userAddress) || {}

        return c.json({
            success: true,
            data: {
                userAddress,
                ...profile,
            },
        })
    } catch (error: any) {
        console.error('Get profile error:', error)
        return c.json({ success: false, error: error.message }, 500)
    }
})

export default app
