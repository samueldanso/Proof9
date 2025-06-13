import dotenv from "dotenv"
import { z } from "zod"

dotenv.config()

const envSchema = z.object({
  // Story Protocol configuration
  PORT: z.coerce.number().default(3001),
  WALLET_PRIVATE_KEY: z.string(),
  PINATA_JWT: z.string(),
  STORY_NETWORK: z.string().default("aeneid"),

  // Optional Web3 variables
  RPC_PROVIDER_URL: z.string().default(""),
  NFT_CONTRACT_ADDRESS: z.string().default(""),
  SPG_NFT_CONTRACT_ADDRESS: z.string().default(""),

  // Yakoa API configuration
  YAKOA_API_KEY: z.string(),
  YAKOA_SUBDOMAIN: z.string().default("docs-demo"),
  YAKOA_NETWORK: z.string().default("docs-demo"),

  // Supabase configuration
  SUPABASE_URL: z.string(),
  SUPABASE_SERVICE_ROLE_KEY: z.string(),
})

export const env = envSchema.parse(process.env)

export type Environment = {
  Bindings: z.infer<typeof envSchema>
}

export default env
