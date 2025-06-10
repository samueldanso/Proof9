import dotenv from 'dotenv'
import { z } from 'zod'

dotenv.config()

// Constants
const YAKOA_API_KEY = process.env.YAKOA_API_KEY || ''
const YAKOA_SUBDOMAIN = process.env.YAKOA_SUBDOMAIN || 'docs-demo'
const YAKOA_NETWORK = process.env.YAKOA_NETWORK || 'docs-demo'
const YAKOA_BASE_URL = `https://${YAKOA_SUBDOMAIN}.ip-api-sandbox.yakoa.io/${YAKOA_NETWORK}`

// Types and Schemas for Yakoa API
export type TrustedPlatformTrustReason = {
    type: 'trusted_platform'
    platform_name: string
}
export type NoLicensesTrustReason = {
    type: 'no_licenses'
    reason: string
}

export type MediaItem = {
    media_id: string
    url: string
    hash?: string
    trust_reason?: TrustedPlatformTrustReason | NoLicensesTrustReason | null
}

export type YakoaToken = {
    id: string
    registration_tx: {
        hash: string
        block_number: number
        timestamp: number
        chain: string
    }
    creator_id: string
    metadata: Record<string, any>
    media: MediaItem[]
    license_parents?: Array<{
        token_id: string
        license_id?: string
    }>
    authorizations?: Array<{
        brand_id?: string
        brand_name?: string
        data: Record<string, any>
    }>
}

export type YakoaTokenResponse = {
    id: string
    registration_tx: {
        hash: string
        block_number: number
        timestamp: number
        chain: string
    }
    creator_id: string
    metadata: Record<string, any>
    media: Array<{
        media_id: string
        url: string
        hash?: string
        trust_reason?: string
        status: string
        infringement_check_status: string
        external_infringements: Array<{
            brand_id: string
            brand_name: string
            confidence: number
            authorized: boolean
        }>
        in_network_infringements: Array<{
            token_id: string
            confidence: number
            licensed: boolean
        }>
    }>
    error?: string
}

export type YakoaAuthorization = {
    brand_id?: string
    brand_name?: string
    data: {
        type: string
        [key: string]: any
    }
}

// Helper function to check if API key is available
const validateApiKey = (): void => {
    if (!YAKOA_API_KEY) {
        throw new Error('YAKOA_API_KEY is required in .env file')
    }
}

// Base fetch function with error handling
async function yakoaFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    validateApiKey()

    const url = `${YAKOA_BASE_URL}${endpoint}`
    const headers = {
        'Content-Type': 'application/json',
        accept: 'application/json',
        'X-API-KEY': YAKOA_API_KEY,
    }

    const response = await fetch(url, {
        ...options,
        headers: { ...headers, ...options.headers } as Record<string, string>,
    })

    if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Yakoa API error (${response.status}): ${errorText}`)
    }

    return response.json() as T
}

/**
 * Register a token with Yakoa for content authentication
 *
 * @param token Token data to register
 * @returns The registered token response
 */
export async function registerToken(token: YakoaToken): Promise<YakoaTokenResponse> {
    return yakoaFetch<YakoaTokenResponse>('/token', {
        method: 'POST',
        body: JSON.stringify(token),
    })
}

/**
 * Get a token's authentication status and infringement check results
 *
 * @param tokenId The token ID to check
 * @returns The token data with authentication status
 */
export async function getToken(tokenId: string): Promise<YakoaTokenResponse> {
    return yakoaFetch<YakoaTokenResponse>(`/token/${encodeURIComponent(tokenId)}`)
}

/**
 * Create or update a brand authorization for a token
 *
 * @param tokenId The token ID to authorize
 * @param authorization The authorization data
 * @returns The created or updated authorization
 */
export async function createTokenAuthorization(tokenId: string, authorization: YakoaAuthorization): Promise<any> {
    return yakoaFetch<any>(`/token/${encodeURIComponent(tokenId)}/authorization`, {
        method: 'POST',
        body: JSON.stringify(authorization),
    })
}

/**
 * Generate a token ID in the format expected by Yakoa (contract_address:token_id)
 *
 * @param contractAddress The NFT contract address
 * @param tokenId The token ID
 * @returns Formatted token ID string
 */
export function formatYakoaTokenId(contractAddress: string, tokenId: string): string {
    return `${contractAddress.toLowerCase()}:${tokenId}`
}

/**
 * Helper function to create media item for Yakoa token registration
 *
 * @param mediaId Unique identifier for the media
 * @param url Publicly accessible URL to the media
 * @param hash Optional hash for content verification
 * @param trustReason Optional trust reason
 * @returns MediaItem object
 */
export function createMediaItem(
    mediaId: string,
    url: string,
    hash?: string,
    trustReason?: TrustedPlatformTrustReason | NoLicensesTrustReason | null
): MediaItem {
    return {
        media_id: mediaId,
        url,
        ...(hash ? { hash } : {}),
        ...(trustReason ? { trust_reason: trustReason } : {}),
    }
}

export default {
    registerToken,
    getToken,
    createTokenAuthorization,
    formatYakoaTokenId,
    createMediaItem,
}
