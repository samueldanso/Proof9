import { createHash } from 'crypto'
import yakoaService, { MediaItem } from '../../src/services/yakoa'
import { account } from '../config'

/**
 * Verify music content with Yakoa before registering with Story Protocol
 *
 * @param title Music title
 * @param description Music description
 * @param creatorId Creator ID (typically wallet address)
 * @param mediaUrl URL to the music file
 * @param imageUrl URL to the image/cover art
 * @param metadata Additional metadata about the music
 * @returns Verification result with tokenId and status
 */
export async function verifyMusicContent(
    title: string,
    description: string,
    creatorId: string = account.address,
    mediaUrl: string,
    imageUrl: string,
    metadata: Record<string, any> = {}
): Promise<{
    tokenId: string
    verificationStatus: Array<{
        mediaId: string
        status: string
        infringementCheckStatus: string
        externalInfringements: Array<any>
        inNetworkInfringements: Array<any>
    }>
}> {
    try {
        // Create a unique media ID based on the URL
        const mediaId = createHash('sha256').update(mediaUrl).digest('hex').slice(0, 16)
        const imageId = createHash('sha256').update(imageUrl).digest('hex').slice(0, 16)

        // Create a unique token ID for this music asset
        const tokenId = `proof9-music-${mediaId}`

        // Create media items for verification
        const mediaItems: MediaItem[] = [
            {
                media_id: `audio-${mediaId}`,
                url: mediaUrl,
            },
            {
                media_id: `image-${imageId}`,
                url: imageUrl,
            },
        ]

        // Current timestamp in seconds
        const timestamp = Math.floor(Date.now() / 1000)

        // Mock transaction for off-chain assets (will be replaced with real tx for on-chain assets)
        const transaction = {
            hash: `0x${createHash('sha256').update(`${tokenId}-${timestamp}`).digest('hex')}`,
            block_number: 0, // Using block_number to match Yakoa's expected format
            timestamp,
            chain: 'proof9', // Custom identifier for off-chain assets
        }

        // Register token with Yakoa
        const response = await yakoaService.registerToken({
            id: tokenId,
            registration_tx: transaction,
            creator_id: creatorId,
            metadata: {
                title,
                description,
                ...metadata,
            },
            media: mediaItems,
        })

        // Format the response
        return {
            tokenId: response.id,
            verificationStatus: response.media.map((media) => ({
                mediaId: media.media_id,
                status: media.status,
                infringementCheckStatus: media.infringement_check_status,
                externalInfringements: media.external_infringements,
                inNetworkInfringements: media.in_network_infringements,
            })),
        }
    } catch (error: any) {
        console.error('Music verification error:', error)
        throw new Error(`Failed to verify music content: ${error.message}`)
    }
}

/**
 * Check verification status of a previously submitted music content
 *
 * @param tokenId The token ID from the initial verification
 * @returns Current verification status
 */
export async function checkMusicVerificationStatus(tokenId: string): Promise<{
    tokenId: string
    verificationStatus: Array<{
        mediaId: string
        status: string
        infringementCheckStatus: string
        externalInfringements: Array<any>
        inNetworkInfringements: Array<any>
    }>
}> {
    try {
        const response = await yakoaService.getToken(tokenId)

        return {
            tokenId: response.id,
            verificationStatus: response.media.map((media) => ({
                mediaId: media.media_id,
                status: media.status,
                infringementCheckStatus: media.infringement_check_status,
                externalInfringements: media.external_infringements,
                inNetworkInfringements: media.in_network_infringements,
            })),
        }
    } catch (error: any) {
        console.error('Verification status check error:', error)
        throw new Error(`Failed to check verification status: ${error.message}`)
    }
}

export default {
    verifyMusicContent,
    checkMusicVerificationStatus,
}
