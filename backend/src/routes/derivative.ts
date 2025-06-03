import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { Address, toHex } from 'viem'
import { WIP_TOKEN_ADDRESS } from '@story-protocol/core-sdk'

import { client, account } from '../../utils/config'
import { 
  SPGNFTContractAddress, 
  NFTContractAddress, 
  RoyaltyPolicyLRP, 
  NonCommercialSocialRemixingTermsId
} from '../../utils/utils'
import { mintNFT } from '../../utils/functions/mintNFT'

// Create router
const app = new Hono()

// Schema for IP metadata
const IpMetadataSchema = z.object({
  ipMetadataURI: z.string(),
  ipMetadataHash: z.string().optional(),
  nftMetadataHash: z.string().optional(),
  nftMetadataURI: z.string()
})

// Base schema for derivative requests
const BaseDerivativeSchema = z.object({
  parentIpIds: z.array(z.string()).min(1),
  metadata: IpMetadataSchema.optional()
})

// Schema for commercial derivative
const CommercialDerivativeSchema = BaseDerivativeSchema.extend({
  licenseTermsIds: z.array(z.string()).min(1),
  claimRevenue: z.boolean().default(true)
})

// Schema for non-commercial derivative
const NonCommercialDerivativeSchema = BaseDerivativeSchema

/**
 * Commercial derivative endpoint
 * Creates a derivative IP Asset using a commercial license
 */
app.post('/commercial', zValidator('json', CommercialDerivativeSchema), async (c) => {
  try {
    const { parentIpIds, licenseTermsIds, metadata, claimRevenue } = c.req.valid('json')

    // Default metadata if not provided
    const ipMetadata = metadata || {
      ipMetadataURI: 'derivative-commercial-uri',
      ipMetadataHash: toHex('derivative-commercial-metadata-hash', { size: 32 }),
      nftMetadataHash: toHex('derivative-commercial-nft-metadata-hash', { size: 32 }),
      nftMetadataURI: 'derivative-commercial-nft-uri',
    }

    // Create derivative
    const childIp = await client.ipAsset.mintAndRegisterIpAndMakeDerivative({
      spgNftContract: SPGNFTContractAddress,
      derivData: {
        parentIpIds: parentIpIds as Address[],
        licenseTermsIds,
      },
      ipMetadata,
      txOptions: { waitForTransaction: true },
    })

    let revenueClaimResult = null
    
    // Claim revenue for parent if requested
    if (claimRevenue) {
      revenueClaimResult = await client.royalty.claimAllRevenue({
        ancestorIpId: parentIpIds[0] as Address,
        claimer: parentIpIds[0] as Address,
        childIpIds: [childIp.ipId as Address],
        royaltyPolicies: [RoyaltyPolicyLRP],
        currencyTokens: [WIP_TOKEN_ADDRESS],
      })
    }

    return c.json({
      success: true,
      data: {
        transactionHash: childIp.txHash,
        ipId: childIp.ipId,
        revenueClaimResult
      }
    })
  } catch (error: any) {
    console.error('Commercial derivative error:', error)
    return c.json({
      success: false,
      error: error.message
    }, 500)
  }
})

/**
 * Non-commercial derivative endpoint
 * Creates a derivative IP Asset using a non-commercial license
 */
app.post('/non-commercial', zValidator('json', NonCommercialDerivativeSchema), async (c) => {
  try {
    const { parentIpIds, metadata } = c.req.valid('json')

    // Default metadata if not provided
    const ipMetadata = metadata || {
      ipMetadataURI: 'derivative-non-commercial-uri',
      ipMetadataHash: toHex('derivative-non-commercial-metadata-hash', { size: 32 }),
      nftMetadataHash: toHex('derivative-non-commercial-nft-metadata-hash', { size: 32 }),
      nftMetadataURI: 'derivative-non-commercial-nft-uri',
    }

    // Create derivative
    const childIp = await client.ipAsset.mintAndRegisterIpAndMakeDerivative({
      spgNftContract: SPGNFTContractAddress,
      derivData: {
        parentIpIds: parentIpIds as Address[],
        licenseTermsIds: [NonCommercialSocialRemixingTermsId],
      },
      ipMetadata,
      txOptions: { waitForTransaction: true },
    })

    return c.json({
      success: true,
      data: {
        transactionHash: childIp.txHash,
        ipId: childIp.ipId
      }
    })
  } catch (error: any) {
    console.error('Non-commercial derivative error:', error)
    return c.json({
      success: false,
      error: error.message
    }, 500)
  }
})

/**
 * Commercial custom derivative endpoint
 * First mints a custom NFT, then registers it as a derivative
 */
app.post('/commercial-custom', zValidator('json', CommercialDerivativeSchema), async (c) => {
  try {
    const { parentIpIds, licenseTermsIds, metadata, claimRevenue } = c.req.valid('json')

    // Default metadata if not provided
    const ipMetadata = metadata || {
      ipMetadataURI: 'derivative-commercial-custom-uri',
      ipMetadataHash: toHex('derivative-commercial-custom-metadata-hash', { size: 32 }),
      nftMetadataHash: toHex('derivative-commercial-custom-nft-metadata-hash', { size: 32 }),
      nftMetadataURI: 'derivative-commercial-custom-nft-uri',
    }

    // Mint custom NFT
    const childTokenId = await mintNFT(account.address, ipMetadata.nftMetadataURI)
    if (!childTokenId) {
      throw new Error('Failed to mint NFT')
    }

    // Register derivative
    const childIp = await client.ipAsset.registerDerivativeIp({
      nftContract: NFTContractAddress,
      tokenId: childTokenId,
      derivData: {
        parentIpIds: parentIpIds as Address[],
        licenseTermsIds,
      },
      ipMetadata,
      txOptions: { waitForTransaction: true },
    })

    let revenueClaimResult = null
    
    // Claim revenue for parent if requested
    if (claimRevenue) {
      revenueClaimResult = await client.royalty.claimAllRevenue({
        ancestorIpId: parentIpIds[0] as Address,
        claimer: parentIpIds[0] as Address,
        childIpIds: [childIp.ipId as Address],
        royaltyPolicies: [RoyaltyPolicyLRP],
        currencyTokens: [WIP_TOKEN_ADDRESS],
      })
    }

    return c.json({
      success: true,
      data: {
        transactionHash: childIp.txHash,
        ipId: childIp.ipId,
        tokenId: childTokenId,
        revenueClaimResult
      }
    })
  } catch (error: any) {
    console.error('Commercial custom derivative error:', error)
    return c.json({
      success: false,
      error: error.message
    }, 500)
  }
})

export default app

