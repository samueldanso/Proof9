import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'

// Create router
const app = new Hono()

// Mock user data
const mockUsers = new Map([
    [
        '0xE89fEf221bdEd027C4c9F07D256b9Dc1422A2455',
        {
            address: '0xE89fEf221bdEd027C4c9F07D256b9Dc1422A2455',
            displayName: '0xE89f...2455',
            trackCount: 3,
            followingCount: 125,
            followersCount: 2487,
            verified: true,
            joinedAt: '2024-01-01',
            tracks: ['1', '2', '3'],
        },
    ],
    [
        '0xA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0',
        {
            address: '0xA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0',
            displayName: '0xA1B2...3456',
            trackCount: 1,
            followingCount: 50,
            followersCount: 1234,
            verified: true,
            joinedAt: '2024-01-05',
            tracks: ['2'],
        },
    ],
])

// Address validation schema
const AddressSchema = z.string().regex(/^0x[a-fA-F0-9]{40}$/, {
    message: 'Address must be a valid Ethereum address',
})

/**
 * Get user profile by address
 */
app.get('/:address', zValidator('param', z.object({ address: AddressSchema })), async (c) => {
    try {
        const { address } = c.req.valid('param')
        const user = mockUsers.get(address)

        if (!user) {
            // Return default user data for new addresses
            const defaultUser = {
                address,
                displayName: `${address.substring(0, 6)}...${address.substring(address.length - 4)}`,
                trackCount: 0,
                followingCount: 0,
                followersCount: 0,
                verified: false,
                joinedAt: new Date().toISOString().split('T')[0],
                tracks: [],
            }

            return c.json({
                success: true,
                data: defaultUser,
            })
        }

        return c.json({
            success: true,
            data: user,
        })
    } catch (error: any) {
        console.error('Get user error:', error)
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
 * Get user's tracks
 */
app.get('/:address/tracks', zValidator('param', z.object({ address: AddressSchema })), async (c) => {
    try {
        const { address } = c.req.valid('param')
        const user = mockUsers.get(address)

        if (!user) {
            return c.json({
                success: true,
                data: { tracks: [] },
            })
        }

        // For now, return mock track IDs
        // In real implementation, query Story Protocol for user's IP assets
        return c.json({
            success: true,
            data: {
                tracks: user.tracks,
                count: user.trackCount,
            },
        })
    } catch (error: any) {
        console.error('Get user tracks error:', error)
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
