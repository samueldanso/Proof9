import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { supabase } from '../lib/supabase'
import { generateUsername, isValidUsername, generateUniqueUsernameSuffix, isEthereumAddress } from '../utils/username'

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
 * Get user profile by username or address
 */
app.get('/:identifier', zValidator('param', z.object({ identifier: z.string() })), async (c) => {
    try {
        const { identifier } = c.req.valid('param')

        // Determine if identifier is an address or username
        const isAddress = isEthereumAddress(identifier)

        // Try to get profile from Supabase
        const query = supabase.from('profiles').select('*')
        const { data: profile, error } = isAddress
            ? await query.eq('address', identifier).single()
            : await query.eq('username', identifier).single()

        if (error || !profile) {
            // Return 404 for username lookups, default for address lookups
            if (!isAddress) {
                return c.json(
                    {
                        success: false,
                        error: 'User not found',
                    },
                    404
                )
            }

            // Return default user data for new addresses
            const defaultUser = {
                address: identifier,
                username: null,
                displayName: `${identifier.substring(0, 6)}...${identifier.substring(identifier.length - 4)}`,
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
        const { count: trackCount } = await supabase.from('tracks').select('id', { count: 'exact' }).eq('artist_address', profile.address)

        // Count followers and following
        const { count: followersCount } = await supabase
            .from('follows')
            .select('id', { count: 'exact' })
            .eq('following_address', profile.address)

        const { count: followingCount } = await supabase
            .from('follows')
            .select('id', { count: 'exact' })
            .eq('follower_address', profile.address)

        // Return profile with stats
        const userWithStats = {
            address: profile.address,
            username: profile.username,
            displayName:
                profile.display_name || `${profile.address.substring(0, 6)}...${profile.address.substring(profile.address.length - 4)}`,
            trackCount: trackCount || 0,
            followingCount: followingCount || 0,
            followersCount: followersCount || 0,
            verified: profile.verified,
            avatar_url: profile.avatar_url,
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

        // Generate username from display name
        const baseUsername = generateUsername(profileData.display_name)

        // Check for existing usernames to ensure uniqueness
        const { data: existingProfiles } = await supabase.from('profiles').select('username').like('username', `${baseUsername}%`)

        const existingUsernames = existingProfiles?.map((p) => p.username).filter(Boolean) || []
        const uniqueUsername = generateUniqueUsernameSuffix(baseUsername, existingUsernames)

        // Insert into Supabase profiles table
        const { data: profile, error } = await supabase
            .from('profiles')
            .insert({
                address: profileData.address,
                username: uniqueUsername,
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
 * Update user profile
 */
app.put(
    '/:address',
    zValidator('param', z.object({ address: AddressSchema })),
    zValidator(
        'json',
        z.object({
            display_name: z.string().min(1, 'Display name is required'),
            username: z.string().optional(),
            avatar_url: z.string().nullable().optional(),
        })
    ),
    async (c) => {
        try {
            const { address } = c.req.valid('param')
            const updateData = c.req.valid('json')

            let finalUsername = updateData.username

            // If username provided, validate it
            if (updateData.username) {
                if (!isValidUsername(updateData.username)) {
                    return c.json(
                        {
                            success: false,
                            error: 'Username must be 3-30 characters and contain only letters and numbers',
                        },
                        400
                    )
                }

                // Check if username is already taken
                const { data: existingProfile } = await supabase
                    .from('profiles')
                    .select('address')
                    .eq('username', updateData.username)
                    .single()

                if (existingProfile && existingProfile.address !== address) {
                    return c.json(
                        {
                            success: false,
                            error: 'Username is already taken',
                        },
                        400
                    )
                }
            } else {
                // If no username provided, generate one from display name
                const baseUsername = generateUsername(updateData.display_name)
                const { data: existingProfiles } = await supabase
                    .from('profiles')
                    .select('username')
                    .like('username', `${baseUsername}%`)
                    .neq('address', address) // Exclude current user

                const existingUsernames = existingProfiles?.map((p) => p.username).filter(Boolean) || []
                finalUsername = generateUniqueUsernameSuffix(baseUsername, existingUsernames)
            }

            // Update profile in Supabase
            const { data: profile, error } = await supabase
                .from('profiles')
                .update({
                    username: finalUsername,
                    display_name: updateData.display_name,
                    avatar_url: updateData.avatar_url || null,
                    updated_at: new Date().toISOString(),
                })
                .eq('address', address)
                .select()
                .single()

            if (error) {
                console.error('Supabase update error:', error)
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
            console.error('Update profile error:', error)
            return c.json(
                {
                    success: false,
                    error: error.message,
                },
                500
            )
        }
    }
)

/**
 * Check username availability
 */
app.get('/check-username/:username', zValidator('param', z.object({ username: z.string() })), async (c) => {
    try {
        const { username } = c.req.valid('param')

        // Validate username format
        if (!isValidUsername(username)) {
            return c.json({
                success: true,
                data: {
                    available: false,
                    reason: 'Username must be 3-30 characters and contain only letters and numbers',
                },
            })
        }

        // Check if username exists
        const { data: existingProfile, error } = await supabase.from('profiles').select('address').eq('username', username).single()

        const available = error?.code === 'PGRST116' // No rows found

        return c.json({
            success: true,
            data: {
                available,
                reason: available ? null : 'Username is already taken',
            },
        })
    } catch (error: any) {
        console.error('Check username availability error:', error)
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

/**
 * Get creator earnings summary
 * GET /api/users/:address/earnings
 */
app.get('/:address/earnings', zValidator('param', z.object({ address: AddressSchema })), async (c) => {
    try {
        const { address } = c.req.valid('param')

        // Get creator's tracks with revenue data
        const { data: tracks, error: tracksError } = await supabase
            .from('tracks')
            .select('total_revenue_earned, total_licenses_sold')
            .eq('artist_address', address)

        if (tracksError) throw tracksError

        // Get creator's revenue claims
        const { data: claims, error: claimsError } = await supabase
            .from('revenue_claims')
            .select('amount_claimed')
            .eq('creator_address', address)

        if (claimsError) throw claimsError

        // Calculate summary
        const totalRevenue = tracks?.reduce((sum, track) => sum + (track.total_revenue_earned || 0), 0) || 0
        const totalLicensesSold = tracks?.reduce((sum, track) => sum + (track.total_licenses_sold || 0), 0) || 0
        const totalClaimed = claims?.reduce((sum, claim) => sum + claim.amount_claimed, 0) || 0
        const pendingRevenue = totalRevenue - totalClaimed

        return c.json({
            success: true,
            data: {
                totalRevenue,
                totalLicensesSold,
                totalClaimed,
                pendingRevenue,
                trackCount: tracks?.length || 0,
            },
        })
    } catch (error: any) {
        console.error('Get earnings summary error:', error)
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
