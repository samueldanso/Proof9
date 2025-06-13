import { createHash } from "node:crypto"
import yakoaService, { MediaItem } from "../../src/services/yakoa"
import { account } from "../config"

/**
 * Verify music content with Yakoa before registering with Story Protocol
 */
export async function verifyMusicContent(
  title: string,
  description: string,
  creatorId: string,
  mediaUrl: string,
  imageUrl: string,
  metadata: Record<string, any> = {},
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
    const mediaId = createHash("sha256")
      .update(mediaUrl)
      .digest("hex")
      .slice(0, 16)
    const imageId = createHash("sha256")
      .update(imageUrl)
      .digest("hex")
      .slice(0, 16)
    const tokenId = `proof9-music-${mediaId}`

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

    const timestamp = Math.floor(Date.now() / 1000)
    const transaction = {
      hash: `0x${createHash("sha256").update(`${tokenId}-${timestamp}`).digest("hex")}`,
      block_number: 0,
      timestamp,
      chain: "proof9",
    }

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

    return {
      tokenId: response.id,
      verificationStatus: response.media.map((media) => ({
        mediaId: media.media_id,
        status: media.status || "unknown",
        infringementCheckStatus: media.infringement_check_status || "unknown",
        externalInfringements: media.external_infringements || [],
        inNetworkInfringements: media.in_network_infringements || [],
      })),
    }
  } catch (error: any) {
    console.error("Music verification error:", error)
    throw new Error(`Failed to verify music content: ${error.message}`)
  }
}

/**
 * Check verification status of a previously submitted music content
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
        status: media.status || "unknown",
        infringementCheckStatus: media.infringement_check_status || "unknown",
        externalInfringements: media.external_infringements || [],
        inNetworkInfringements: media.in_network_infringements || [],
      })),
    }
  } catch (error: any) {
    console.error("Verification status check error:", error)
    throw new Error(`Failed to check verification status: ${error.message}`)
  }
}

export default {
  verifyMusicContent,
  checkMusicVerificationStatus,
}
