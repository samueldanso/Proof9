import { z } from 'zod'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// Environment validation schema matching your actual .env
const envSchema = z.object({
    // Server configuration
    PORT: z.coerce.number().default(3001), // Use 3001 for API server
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    CORS_ORIGIN: z.string().default('*'),
    LOG_LEVEL: z.string().optional().default('debug'),
    REQUEST_TIMEOUT: z.coerce.number().optional().default(60000),

    // Story Protocol configuration (Required)
    WALLET_PRIVATE_KEY: z.string().min(1),
    PINATA_JWT: z.string().min(1),
    STORY_NETWORK: z.string().default('aeneid'),

    // Optional Web3 variables (can be empty)
    RPC_PROVIDER_URL: z.string().default(''),
    NFT_CONTRACT_ADDRESS: z.string().default(''),
    SPG_NFT_CONTRACT_ADDRESS: z.string().default(''),

    // Yakoa API configuration (has values)
    YAKOA_API_KEY: z.string().default('VeCf5828798T2uB9ZUSGB91IzTEP5ukw71vNFgGn'),
    YAKOA_SUBDOMAIN: z.string().default('docs-demo'),
    YAKOA_NETWORK: z.string().default('story-mainnet'),

    // Legacy IPFS config (optional)
    PINATA_API_KEY: z.string().optional().default(''),
    PINATA_API_SECRET: z.string().optional().default(''),
})

// Validate and export environment variables
export const env = envSchema.parse(process.env)

// Log configuration in development
if (env.NODE_ENV === 'development') {
    console.log('🔧 Environment Configuration:')
    console.log(`   - Network: ${env.STORY_NETWORK}`)
    console.log(`   - Port: ${env.PORT}`)
    console.log(`   - CORS: ${env.CORS_ORIGIN}`)
    console.log(`   - Yakoa: ${env.YAKOA_SUBDOMAIN}.yakoa.ai`)
}

// Type for environment variables
export type Environment = z.infer<typeof envSchema>
