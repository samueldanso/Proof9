import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { Address, parseEther } from 'viem'
import * as sha256 from 'multiformats/hashes/sha2'
import { CID } from 'multiformats/cid'

import { client } from '../../utils/config'

// Create router
const app = new Hono()

// Define allowed dispute tags
const DISPUTE_TAGS = [
  'IMPROPER_REGISTRATION',
  'UNAUTHORIZED_DERIVATIVE',
  'COPYRIGHT_VIOLATION',
  'TRADEMARK_VIOLATION',
  'PATENT_VIOLATION',
  'COUNTERFEITING',
  'IMPERSONATION'
] as const

// Schema for dispute request
const DisputeSchema = z.object({
  targetIpId: z.string().regex(/^0x[a-fA-F0-9]{40}$/, {
    message: 'IP ID must be a valid Ethereum address'
  }),
  targetTag: z.enum(DISPUTE_TAGS),
  bond: z.number().positive().default(0.1),
  liveness: z.number().int().positive().default(2592000), // 30 days in seconds
  cid: z.string().optional(), // Optional CID, will be generated if not provided
  evidence: z.string().optional() // Optional evidence string to generate CID from
})

/**
 * Dispute endpoint
 * Raises a dispute against an IP asset
 */
app.post('/dispute', zValidator('json', DisputeSchema), async (c) => {
  try {
    const { targetIpId, targetTag, bond, liveness, cid: providedCid, evidence } = c.req.valid('json')

    // Generate CID if not provided
    const cid = providedCid || await generateCID(evidence)

    // Parse bond from ETH to Wei
    const bondInWei = parseEther(bond.toString())

    // Raise dispute
    const disputeResponse = await client.dispute.raiseDispute({
      targetIpId: targetIpId as Address,
      cid,
      targetTag,
      bond: bondInWei,
      liveness,
      txOptions: { waitForTransaction: true },
    })

    return c.json({
      success: true,
      data: {
        transactionHash: disputeResponse.txHash,
        disputeId: disputeResponse.disputeId,
        targetIpId,
        cid
      }
    })
  } catch (error: any) {
    console.error('Dispute error:', error)
    return c.json({
      success: false,
      error: error.message
    }, 500)
  }
})

/**
 * Helper function to generate a CID for dispute evidence
 * @param content Optional content to hash, uses random bytes if not provided
 * @returns CID string
 */
async function generateCID(content?: string): Promise<string> {
  try {
    // Generate bytes to hash (either from content or random)
    let bytes: Uint8Array
    if (content) {
      // Convert string to bytes
      const encoder = new TextEncoder()
      bytes = encoder.encode(content)
    } else {
      // Generate random bytes
      bytes = crypto.getRandomValues(new Uint8Array(32))
    }

    // Hash the bytes using SHA-256
    const hash = await sha256.sha256.digest(bytes)
    
    // Create a CIDv1 in dag-pb format
    const cidv1 = CID.createV1(0x70, hash) // 0x70 = dag-pb codec
    
    // Convert CIDv1 to CIDv0 (Base58-encoded)
    return cidv1.toV0().toString()
  } catch (error) {
    console.error('Error generating CID:', error)
    throw new Error('Failed to generate CID for dispute evidence')
  }
}

export default app

