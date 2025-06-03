import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { encodeFunctionData, zeroAddress } from 'viem'
import { createHash } from 'crypto'
import { IpMetadata } from '@story-protocol/core-sdk'

import { client, account, networkInfo, walletClient } from '../../utils/config'
import { createCommercialRemixTerms, defaultLicensingConfig, SPGNFTContractAddress } from '../../utils/utils'
import { uploadJSONToIPFS } from '../../utils/functions/uploadToIpfs'
import { licenseAttachmentWorkflowsAbi } from '../../utils/abi/licenseAttachmentWorkflowsAbi'

// Create router
const app = new Hono()

// Schema for sending raw transactions
const SendRawTransactionSchema = z.object({
  ipMetadata: z.object({
    title: z.string(),
    description: z.string(),
    createdAt: z.string().optional(),
    creators: z.array(z.object({
      name: z.string(),
      address: z.string(),
      contributionPercent: z.number().int().min(1).max(100)
    })),
    image: z.string().url(),
    imageHash: z.string().optional(),
    mediaUrl: z.string().url().optional(),
    mediaHash: z.string().optional(),
    mediaType: z.string().optional()
  }),
  nftMetadata: z.object({
    name: z.string(),
    description: z.string(),
    image: z.string().url(),
    animation_url: z.string().url().optional(),
    attributes: z.array(z.object({
      key: z.string(),
      value: z.string()
    })).optional()
  }),
  contractAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, {
    message: 'Contract address must be a valid Ethereum address'
  }).optional(),
  commercialTerms: z.object({
    defaultMintingFee: z.number().default(0),
    commercialRevShare: z.number().int().min(0).max(100).default(0)
  }).optional()
})

// Schema for creating SPG NFT collections
const CreateSpgCollectionSchema = z.object({
  name: z.string(),
  symbol: z.string(),
  isPublicMinting: z.boolean().default(true),
  mintOpen: z.boolean().default(true),
  mintFeeRecipient: z.string().regex(/^0x[a-fA-F0-9]{40}$/, {
    message: 'Mint fee recipient must be a valid Ethereum address'
  }).default(zeroAddress),
  contractURI: z.string().default('')
})

/**
 * Send raw transaction endpoint
 * Sends a raw transaction for minting and registering an IP asset
 */
app.post('/send-raw-transaction', zValidator('json', SendRawTransactionSchema), async (c) => {
  try {
    const { ipMetadata: ipMetadataInput, nftMetadata, contractAddress, commercialTerms } = c.req.valid('json')
    
    // Format IP metadata according to Story Protocol requirements
    const ipMetadata: IpMetadata = client.ipAsset.generateIpMetadata({
      ...ipMetadataInput,
      createdAt: ipMetadataInput.createdAt || Math.floor(Date.now() / 1000).toString()
    })
    
    // Upload metadata to IPFS
    const ipIpfsHash = await uploadJSONToIPFS(ipMetadata)
    const ipHash = createHash('sha256').update(JSON.stringify(ipMetadata)).digest('hex')
    const nftIpfsHash = await uploadJSONToIPFS(nftMetadata)
    const nftHash = createHash('sha256').update(JSON.stringify(nftMetadata)).digest('hex')
    
    // Prepare transaction request
    const targetContract = contractAddress || '0xcC2E862bCee5B6036Db0de6E06Ae87e524a79fd8'
    const terms = commercialTerms || { defaultMintingFee: 0, commercialRevShare: 0 }
    
    const transactionRequest = {
      to: targetContract as `0x${string}`,
      data: encodeFunctionData({
        abi: licenseAttachmentWorkflowsAbi,
        functionName: 'mintAndRegisterIpAndAttachPILTerms',
        args: [
          SPGNFTContractAddress,
          account.address,
          {
            ipMetadataURI: `https://ipfs.io/ipfs/${ipIpfsHash}`,
            ipMetadataHash: `0x${ipHash}`,
            nftMetadataURI: `https://ipfs.io/ipfs/${nftIpfsHash}`,
            nftMetadataHash: `0x${nftHash}`,
          },
          [
            {
              terms: createCommercialRemixTerms(terms),
              licensingConfig: defaultLicensingConfig,
            },
          ],
          true,
        ],
      }),
    }
    
    // Send transaction
    const txHash = await walletClient.sendTransaction({
      ...transactionRequest,
      account,
      chain: networkInfo.chain,
    })
    
    return c.json({
      success: true,
      data: {
        transactionHash: txHash,
        blockExplorerUrl: `${networkInfo.blockExplorer}/tx/${txHash}`
      }
    })
  } catch (error: any) {
    console.error('Raw transaction error:', error)
    return c.json({
      success: false,
      error: error.message
    }, 500)
  }
})

/**
 * Create SPG NFT collection endpoint
 * Creates a new SPG NFT collection
 */
app.post('/create-spg-collection', zValidator('json', CreateSpgCollectionSchema), async (c) => {
  try {
    const { name, symbol, isPublicMinting, mintOpen, mintFeeRecipient, contractURI } = c.req.valid('json')
    
    // Create NFT collection
    const newCollection = await client.nftClient.createNFTCollection({
      name,
      symbol,
      isPublicMinting,
      mintOpen,
      mintFeeRecipient: mintFeeRecipient as `0x${string}`,
      contractURI,
      txOptions: { waitForTransaction: true },
    })
    
    return c.json({
      success: true,
      data: {
        spgNftContract: newCollection.spgNftContract,
        transactionHash: newCollection.txHash
      }
    })
  } catch (error: any) {
    console.error('Create SPG collection error:', error)
    return c.json({
      success: false,
      error: error.message
    }, 500)
  }
})

export default app

