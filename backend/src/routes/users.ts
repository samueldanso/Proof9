import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { supabase } from '../lib/supabase'

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

        // Try to get profile from Supabase
        const { data: profile, error } = await supabase.from('profiles').select('*').eq('address', address).single()

        if (error || !profile) {
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

        // Count user's tracks
        const { count: trackCount } = await supabase.from('tracks').select('id', { count: 'exact' }).eq('artist_address', address)

        // Count followers and following
        const { count: followersCount } = await supabase.from('follows').select('id', { count: 'exact' }).eq('following_address', address)

        const { count: followingCount } = await supabase.from('follows').select('id', { count: 'exact' }).eq('follower_address', address)

        // Return profile with stats
        const userWithStats = {
            address: profile.address,
            displayName: profile.display_name || `${address.substring(0, 6)}...${address.substring(address.length - 4)}`,
            trackCount: trackCount || 0,
            followingCount: followingCount || 0,
            followersCount: followersCount || 0,
            verified: profile.verified,
            joinedAt: profile.created_at.split('T')[0],
            tracks: [], // Will be populated by the tracks endpoint
        }

        return c.json({
            success: true,
            data: userWithStats,
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

        // Get user's tracks from Supabase
        const { data: tracks, error } = await supabase
            .from('tracks')
            .select('id')
            .eq('artist_address', address)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Get user tracks error:', error)
            return c.json({
                success: true,
                data: { tracks: [], count: 0 },
            })
        }

        const trackIds = tracks.map((track) => track.id)

        return c.json({
            success: true,
            data: {
                tracks: trackIds,
                count: trackIds.length,
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

// Schema for profile creation
const CreateProfileSchema = z.object({
    address: AddressSchema,
    display_name: z.string().min(1, 'Display name is required'),
    avatar_url: z.string().nullable().optional(),
})

/**
 * Create user profile
 */
app.post('/create-profile', zValidator('json', CreateProfileSchema), async (c) => {
    try {
        const profileData = c.req.valid('json')

        // Insert into Supabase profiles table
        const { data: profile, error } = await supabase
            .from('profiles')
            .insert({
                address: profileData.address,
                display_name: profileData.display_name,
                avatar_url: profileData.avatar_url || null,
                verified: false,
            })
            .select()
            .single()

        if (error) {
            console.error('Supabase insert error:', error)
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
            data: profile,
        })
    } catch (error: any) {
        console.error('Create profile error:', error)
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
 * Check onboarding status
 */
app.get('/:address/onboarding-status', zValidator('param', z.object({ address: AddressSchema })), async (c) => {
    try {
        const { address } = c.req.valid('param')

        // Check if profile exists in Supabase
        const { data: profile, error } = await supabase.from('profiles').select('address').eq('address', address).single()

        // If no error and profile exists, user has completed onboarding
        const hasProfile = !error && profile !== null

        return c.json({
            success: true,
            data: { hasProfile },
        })
    } catch (error: any) {
        console.error('Check onboarding status error:', error)
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
