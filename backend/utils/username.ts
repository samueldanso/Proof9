/**
 * Username generation utilities
 */

/**
 * Generate URL-safe username from display name
 * "Music Maker!" -> "musicmaker"
 * "DJ-K3N" -> "djk3n"
 */
export function generateUsername(displayName: string): string {
  return displayName
    .toLowerCase() // Convert to lowercase
    .replace(/[^a-z0-9]/g, "") // Remove all non-alphanumeric characters
    .trim() // Remove leading/trailing spaces
    .substring(0, 30) // Limit length to 30 characters
}

/**
 * Validate username format
 * Must be 3-30 characters, alphanumeric only
 */
export function isValidUsername(username: string): boolean {
  const usernameRegex = /^[a-z0-9]{3,30}$/
  return usernameRegex.test(username)
}

/**
 * Generate unique username with suffix if needed
 * If "samueldanso" exists, try "samueldanso2", "samueldanso3", etc.
 */
export function generateUniqueUsernameSuffix(
  baseUsername: string,
  existingUsernames: string[],
): string {
  if (!existingUsernames.includes(baseUsername)) {
    return baseUsername
  }

  let counter = 2
  let candidateUsername = `${baseUsername}${counter}`

  while (existingUsernames.includes(candidateUsername)) {
    counter++
    candidateUsername = `${baseUsername}${counter}`
  }

  return candidateUsername
}

/**
 * Check if a string looks like an Ethereum address
 */
export function isEthereumAddress(input: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(input)
}
