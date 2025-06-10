/**
 * PROOF9 YAKOA VERIFICATION API
 *
 * This module implements Yakoa content authentication API for music verification.
 * Follows Yakoa's exact conventions and naming patterns for seamless integration.
 *
 * Yakoa Documentation: https://docs.yakoa.io/reference/register-token
 *
 * Production Requirements:
 * - Real Ethereum addresses for creator_id (from connected wallet)
 * - Valid transaction hashes (32-byte hex strings)
 * - Publicly accessible IPFS URLs for media
 * - Proper content hashes for integrity verification
 */

import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { createHash } from 'crypto'

import yakoaService, { MediaItem, YakoaToken, TrustedPlatformTrustReason, NoLicensesTrustReason } from '../services/yakoa'

// Create router
const app = new Hono()

// Schema for media verification
const MediaItemSchema = z.object({
    media_id: z.string().min(1, 'Media ID is required'),
    url: z.string().url('Must be a valid URL - IPFS URLs are recommended for content integrity'),
    hash: z
        .string()
        .regex(/^[a-f0-9]{64}$/, 'Hash must be a 64-character hex string (SHA-256)')
        .optional(),
    trust_reason: z.union([z.object({ platform: z.string() }), z.object({ reason: z.literal('no_licenses') }), z.null()]).optional(),
})

const VerifyMusicSchema = z.object({
    tokenId: z.string().optional(),
    contractAddress: z
        .string()
        .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid contract address format')
        .optional(),
    onChainTokenId: z.string().optional(),
    creatorId: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid creator address - must be a valid Ethereum address'),
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(1, 'Description is required'),
    metadata: z.record(z.any()).optional(),
    mediaItems: z.array(MediaItemSchema).min(1, 'At least one media item is required'),
    transaction: z.object({
        hash: z.string().regex(/^0x[a-fA-F0-9]{64}$/, 'Invalid transaction hash format'),
        blockNumber: z.number().int().positive('Block number must be positive'),
        timestamp: z.number().int().positive('Timestamp must be positive'),
        chain: z.string().min(1, 'Chain is required'),
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
                : (() => {
                      // For production: We should have a real contract address
                      // For now, create a deterministic ID based on content and creator
                      const contentHash = createHash('sha256')
                          .update(
                              JSON.stringify({
                                  creator: creatorId,
                                  media: mediaItems,
                                  timestamp: transaction.timestamp,
                              })
                          )
                          .digest('hex')

                      // Use a deterministic approach: creator address + content hash slice as token ID
                      return `${creatorId}:${parseInt(contentHash.slice(0, 8), 16)}`
                  })())

        // Prepare token data for Yakoa
        const yakoaToken: YakoaToken = {
            id: resolvedTokenId,
            registration_tx: {
                hash:
                    transaction.hash.startsWith('0x') && transaction.hash.length === 66
                        ? transaction.hash
                        : `0x${createHash('sha256').update(`${creatorId}-${Date.now()}`).digest('hex')}`,
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
