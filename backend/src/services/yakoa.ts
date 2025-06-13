import dotenv from 'dotenv'

dotenv.config()

const YAKOA_API_KEY = process.env.YAKOA_API_KEY || ''
const YAKOA_SUBDOMAIN = process.env.YAKOA_SUBDOMAIN || 'docs-demo'
const YAKOA_NETWORK = process.env.YAKOA_NETWORK || 'docs-demo'
const YAKOA_BASE_URL = `https://${YAKOA_SUBDOMAIN}.ip-api-sandbox.yakoa.io/${YAKOA_NETWORK}`
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
        hash?: string | null
        trust_reason?: TrustedPlatformTrustReason | NoLicensesTrustReason | null
        fetch_status?: string
        uri_id?: string | null
        status?: string
        infringement_check_status?: string
        external_infringements?: Array<{
            brand_id: string
            brand_name: string
            confidence: number
            authorized: boolean
        }>
        in_network_infringements?: Array<{
            token_id: string
            confidence: number
            licensed: boolean
        }>
    }>
    infringements?: {
        status: string
        result: string
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
        credits?: Record<string, any>
    }
    license_parents?: Array<{
        token_id: string
        license_id?: string
    }>
    token_authorizations?: Array<any>
    creator_authorizations?: Array<any>
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

const validateApiKey = (): void => {
    if (!YAKOA_API_KEY) {
        throw new Error('YAKOA_API_KEY is required in .env file')
    }
}
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
 */
export async function registerToken(token: YakoaToken): Promise<YakoaTokenResponse> {
    return yakoaFetch<YakoaTokenResponse>('/token', {
        method: 'POST',
        body: JSON.stringify(token),
    })
}

/**
 * Get a token's authentication status and infringement check results
 */
export async function getToken(tokenId: string): Promise<YakoaTokenResponse> {
    return yakoaFetch<YakoaTokenResponse>(`/token/${encodeURIComponent(tokenId)}`)
}

/**
 * Create or update a brand authorization for a token
 */
export async function createTokenAuthorization(tokenId: string, authorization: YakoaAuthorization): Promise<any> {
    return yakoaFetch<any>(`/token/${encodeURIComponent(tokenId)}/authorization`, {
        method: 'POST',
        body: JSON.stringify(authorization),
    })
}

/**
 * Generate a token ID in the format expected by Yakoa (contract_address:token_id)
 */
export function formatYakoaTokenId(contractAddress: string, tokenId: string): string {
    return `${contractAddress.toLowerCase()}:${tokenId}`
}

/**
 * Helper function to create media item for Yakoa token registration
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
