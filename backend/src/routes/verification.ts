import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { createHash } from 'crypto'

import yakoaService, { MediaItem, YakoaToken, TrustedPlatformTrustReason, NoLicensesTrustReason } from '../services/yakoa'

// Create router
const app = new Hono()

// Schema for media verification
const MediaItemSchema = z.object({
    media_id: z.string(),
    url: z.string().url(),
    hash: z.string().optional(),
    trust_reason: z.union([z.object({ platform: z.string() }), z.object({ reason: z.literal('no_licenses') }), z.null()]).optional(),
})

const VerifyMusicSchema = z.object({
    tokenId: z.string().optional(),
    contractAddress: z.string().optional(),
    onChainTokenId: z.string().optional(),
    creatorId: z.string(),
    title: z.string(),
    description: z.string(),
    metadata: z.record(z.any()).optional(),
    mediaItems: z.array(MediaItemSchema).min(1),
    transaction: z.object({
        hash: z.string(),
        blockNumber: z.number(),
        timestamp: z.number(),
        chain: z.string(),
    }),
    licenseParents: z
        .array(
            z.object({
                token_id: z.string(),
                license_id: z.string().optional(),
            })
        )
        .optional(),
})

const TokenIdSchema = z.object({
    tokenId: z.string(),
})

const AuthorizationSchema = z.object({
    tokenId: z.string(),
    brandId: z.string().optional(),
    brandName: z.string().optional(),
    authorizationType: z.string(),
    authorizationData: z.record(z.any()),
})

/**
 * Verify music content with Yakoa
 * This endpoint registers a token with Yakoa for content authentication
 */
app.post('/verify-music', zValidator('json', VerifyMusicSchema), async (c) => {
    try {
        const {
            tokenId,
            contractAddress,
            onChainTokenId,
            creatorId,
            title,
            description,
            metadata,
            mediaItems,
            transaction,
            licenseParents,
        } = c.req.valid('json')

        // Generate a token ID if not provided
        const resolvedTokenId =
            tokenId ||
            (contractAddress && onChainTokenId
                ? yakoaService.formatYakoaTokenId(contractAddress, onChainTokenId)
                : `proof9-${createHash('sha256').update(JSON.stringify(mediaItems[0])).digest('hex').slice(0, 16)}`)

        // Prepare token data for Yakoa
        const yakoaToken: YakoaToken = {
            id: resolvedTokenId,
            registration_tx: {
                hash: transaction.hash,
                block_number: transaction.blockNumber,
                timestamp: transaction.timestamp,
                chain: transaction.chain,
            },
            creator_id: creatorId,
            metadata: {
                title,
                description,
                ...(metadata || {}),
            },
            media: mediaItems,
            ...(licenseParents && licenseParents.length > 0 ? { license_parents: licenseParents } : {}),
        }

        // Register the token with Yakoa
        const response = await yakoaService.registerToken(yakoaToken)

        return c.json({
            success: true,
            data: {
                tokenId: response.id,
                verificationStatus: response.media.map((media) => ({
                    mediaId: media.media_id,
                    status: media.status,
                    infringementCheckStatus: media.infringement_check_status,
                    externalInfringements: media.external_infringements,
                    inNetworkInfringements: media.in_network_infringements,
                })),
            },
        })
    } catch (error: any) {
        console.error('Music verification error:', error)
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
 * Get verification status
 * This endpoint retrieves the verification status of a token
 */
app.get('/status/:tokenId', zValidator('param', TokenIdSchema), async (c) => {
    try {
        const { tokenId } = c.req.valid('param')

        const response = await yakoaService.getToken(tokenId)

        return c.json({
            success: true,
            data: {
                tokenId: response.id,
                verificationStatus: response.media.map((media) => ({
                    mediaId: media.media_id,
                    status: media.status,
                    infringementCheckStatus: media.infringement_check_status,
                    externalInfringements: media.external_infringements,
                    inNetworkInfringements: media.in_network_infringements,
                })),
            },
        })
    } catch (error: any) {
        console.error('Verification status error:', error)
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
 * Create brand authorization
 * This endpoint creates or updates a brand authorization for a token
 */
app.post('/authorize', zValidator('json', AuthorizationSchema), async (c) => {
    try {
        const { tokenId, brandId, brandName, authorizationType, authorizationData } = c.req.valid('json')

        if (!brandId && !brandName) {
            return c.json(
                {
                    success: false,
                    error: 'Either brandId or brandName must be provided',
                },
                400
            )
        }

        const authorization = {
            ...(brandId ? { brand_id: brandId } : {}),
            ...(brandName ? { brand_name: brandName } : {}),
            data: {
                type: authorizationType,
                ...authorizationData,
            },
        }

        const response = await yakoaService.createTokenAuthorization(tokenId, authorization)

        return c.json({
            success: true,
            data: response,
        })
    } catch (error: any) {
        console.error('Authorization error:', error)
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
