/**
 * IPFS Gateway Utilities
 * Handles IPFS URLs with multiple gateway fallbacks for better reliability
 */

// List of IPFS gateways to try (in order of preference)
const IPFS_GATEWAYS = [
  "https://ipfs.io/ipfs/",
  "https://gateway.pinata.cloud/ipfs/",
  "https://cloudflare-ipfs.com/ipfs/",
  "https://dweb.link/ipfs/",
  "https://ipfs.infura.io/ipfs/",
];

/**
 * Extract IPFS hash from various URL formats
 * @param url - IPFS URL in various formats
 * @returns IPFS hash or null if not valid
 */
export function extractIpfsHash(url: string): string | null {
  if (!url?.trim()) return null;

  // Direct hash (starts with Qm or bafy)
  if (url.match(/^(Qm[1-9A-HJ-NP-Za-km-z]{44}|bafy[a-z0-9]{55})$/)) {
    return url;
  }

  // ipfs:// protocol
  if (url.startsWith("ipfs://")) {
    const hash = url.replace("ipfs://", "");
    return hash.match(/^(Qm[1-9A-HJ-NP-Za-km-z]{44}|bafy[a-z0-9]{55})/) ? hash : null;
  }

  // Gateway URL - extract hash from path
  const gatewayMatch = url.match(/\/ipfs\/((Qm[1-9A-HJ-NP-Za-km-z]{44}|bafy[a-z0-9]{55}))/);
  if (gatewayMatch) {
    return gatewayMatch[1];
  }

  return null;
}

/**
 * Convert IPFS URL to a reliable gateway URL
 * @param ipfsUrl - IPFS URL in any format
 * @param gatewayIndex - Which gateway to use (for fallbacks)
 * @returns Gateway URL or null if invalid
 */
export function getIpfsGatewayUrl(ipfsUrl: string, gatewayIndex = 0): string | null {
  const hash = extractIpfsHash(ipfsUrl);
  if (!hash) return null;

  const gateway = IPFS_GATEWAYS[gatewayIndex];
  if (!gateway) return null;

  return `${gateway}${hash}`;
}

/**
 * Get all possible gateway URLs for an IPFS hash
 * @param ipfsUrl - IPFS URL in any format
 * @returns Array of gateway URLs to try
 */
export function getAllIpfsGatewayUrls(ipfsUrl: string): string[] {
  const hash = extractIpfsHash(ipfsUrl);
  if (!hash) return [];

  return IPFS_GATEWAYS.map((gateway) => `${gateway}${hash}`);
}

/**
 * Test if an IPFS URL is accessible
 * @param url - URL to test
 * @param timeout - Timeout in milliseconds
 * @returns Promise resolving to true if accessible
 */
export async function testIpfsUrl(url: string, timeout = 5000): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Find the first working IPFS gateway URL
 * @param ipfsUrl - IPFS URL in any format
 * @param timeout - Timeout per gateway test
 * @returns Promise resolving to working URL or null
 */
export async function findWorkingIpfsUrl(ipfsUrl: string, timeout = 3000): Promise<string | null> {
  const gatewayUrls = getAllIpfsGatewayUrls(ipfsUrl);

  console.log(`🔗 Testing ${gatewayUrls.length} IPFS gateways for: ${ipfsUrl}`);

  for (const url of gatewayUrls) {
    console.log(`🔍 Testing gateway: ${url}`);
    const isWorking = await testIpfsUrl(url, timeout);

    if (isWorking) {
      console.log(`✅ Working gateway found: ${url}`);
      return url;
    } else {
      console.log(`❌ Gateway failed: ${url}`);
    }
  }

  console.error(`🚨 No working IPFS gateway found for: ${ipfsUrl}`);
  return null;
}

/**
 * Create a URL with fallback gateways for better reliability
 * @param ipfsUrl - IPFS URL in any format
 * @returns Primary gateway URL (caller should handle fallbacks)
 */
export function createIpfsUrl(ipfsUrl: string): string | null {
  return getIpfsGatewayUrl(ipfsUrl, 0); // Use primary gateway
}

/**
 * Fix common IPFS URL issues
 * @param url - Potentially problematic IPFS URL
 * @returns Fixed URL or original if no issues found
 */
export function fixIpfsUrl(url: string): string {
  if (!url?.trim()) return url;

  // If it's already a valid HTTP URL, return as is
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  // Try to create a proper gateway URL
  const fixedUrl = createIpfsUrl(url);
  return fixedUrl || url;
}
