import { createHash } from "node:crypto"
import { zValidator } from "@hono/zod-validator"
import { IpMetadata } from "@story-protocol/core-sdk"
import { Hono } from "hono"
import { z } from "zod"

import { account, client, networkInfo } from "../../../utils/config"
import { mintNFT } from "../../../utils/functions/mintNFT"
import { uploadJSONToIPFS } from "../../../utils/functions/uploadToIpfs"
import {
  NFTContractAddress,
  SPGNFTContractAddress,
  createCommercialRemixTerms,
} from "../../../utils/utils"

const registrationRouter = new Hono()

// Schema for IP metadata
const CreatorSchema = z.object({
  name: z.string(),
  address: z.string(),
  contributionPercent: z.number().int().min(1).max(100),
})

const IpMetadataSchema = z.object({
  title: z.string(),
  description: z.string(),
  createdAt: z.string().optional(),
  creators: z.array(CreatorSchema),
  image: z.string().url(),
  imageHash: z.string().optional(),
  mediaUrl: z.string().url().optional(),
  mediaHash: z.string().optional(),
  mediaType: z.string().optional(),
})

// Schema for NFT metadata
const AttributeSchema = z.object({
  key: z.string(),
  value: z.string(),
})

const NftMetadataSchema = z.object({
  name: z.string(),
  description: z.string(),
  image: z.string().url(),
  animation_url: z.string().url().optional(),
  attributes: z.array(AttributeSchema).optional(),
})

// Schema for registration request
const RegistrationSchema = z.object({
  ipMetadata: IpMetadataSchema,
  nftMetadata: NftMetadataSchema,
  commercialRemixTerms: z
    .object({
      defaultMintingFee: z.number().default(1),
      commercialRevShare: z.number().int().min(0).max(100).default(5),
    })
    .optional(),
})

/**
 * Regular registration endpoint
 * Registers IP Asset through Story Protocol's SPG NFT contract
 */
registrationRouter.post(
  "/register",
  zValidator("json", RegistrationSchema),
  async (c) => {
    try {
      const {
        ipMetadata: ipMetadataInput,
        nftMetadata,
        commercialRemixTerms,
      } = c.req.valid("json")

      // Format IP metadata according to Story Protocol requirements
      const ipMetadata: IpMetadata = client.ipAsset.generateIpMetadata({
        ...ipMetadataInput,
        createdAt:
          ipMetadataInput.createdAt || Math.floor(Date.now() / 1000).toString(),
      } as IpMetadata)

      // Upload metadata to IPFS
      const ipIpfsHash = await uploadJSONToIPFS(ipMetadata)
      const ipHash = createHash("sha256")
        .update(JSON.stringify(ipMetadata))
        .digest("hex")
      const nftIpfsHash = await uploadJSONToIPFS(nftMetadata)
      const nftHash = createHash("sha256")
        .update(JSON.stringify(nftMetadata))
        .digest("hex")

      // Register the NFT as an IP Asset
      const terms = commercialRemixTerms || {
        defaultMintingFee: 1,
        commercialRevShare: 5,
      }
      const response = await client.ipAsset.mintAndRegisterIpAssetWithPilTerms({
        spgNftContract: SPGNFTContractAddress,
        licenseTermsData: [
          {
            terms: createCommercialRemixTerms(terms),
          },
        ],
        ipMetadata: {
          ipMetadataURI: `https://ipfs.io/ipfs/${ipIpfsHash}`,
          ipMetadataHash: `0x${ipHash}`,
          nftMetadataURI: `https://ipfs.io/ipfs/${nftIpfsHash}`,
          nftMetadataHash: `0x${nftHash}`,
        },
        txOptions: { waitForTransaction: true },
      })

      return c.json({
        success: true,
        data: {
          transactionHash: response.txHash,
          ipId: response.ipId,
          licenseTermsIds:
            response.licenseTermsIds?.map((id) => id.toString()) || [],
          explorerUrl: `${networkInfo.protocolExplorer}/ipa/${response.ipId}`,
        },
      })
    } catch (error: any) {
      console.error("Registration error:", error)
      return c.json(
        {
          success: false,
          error: error.message,
        },
        500,
      )
    }
  },
)

/**
 * Custom registration endpoint
 * Mints NFT first, then registers it as an IP Asset
 */
registrationRouter.post(
  "/register-custom",
  zValidator("json", RegistrationSchema),
  async (c) => {
    try {
      const {
        ipMetadata: ipMetadataInput,
        nftMetadata,
        commercialRemixTerms,
      } = c.req.valid("json")

      // Format IP metadata according to Story Protocol requirements
      const ipMetadata: IpMetadata = client.ipAsset.generateIpMetadata({
        ...ipMetadataInput,
        createdAt:
          ipMetadataInput.createdAt || Math.floor(Date.now() / 1000).toString(),
      } as IpMetadata)

      // Upload metadata to IPFS
      const ipIpfsHash = await uploadJSONToIPFS(ipMetadata)
      const ipHash = createHash("sha256")
        .update(JSON.stringify(ipMetadata))
        .digest("hex")
      const nftIpfsHash = await uploadJSONToIPFS(nftMetadata)
      const nftHash = createHash("sha256")
        .update(JSON.stringify(nftMetadata))
        .digest("hex")

      // Mint an NFT
      const tokenId = await mintNFT(
        account.address,
        `https://ipfs.io/ipfs/${nftIpfsHash}`,
      )
      if (!tokenId) {
        throw new Error("Failed to mint NFT")
      }

      // Register an IP Asset
      const terms = commercialRemixTerms || {
        defaultMintingFee: 1,
        commercialRevShare: 5,
      }
      const response = await client.ipAsset.registerIpAndAttachPilTerms({
        nftContract: NFTContractAddress,
        tokenId: tokenId,
        licenseTermsData: [
          {
            terms: createCommercialRemixTerms(terms),
          },
        ],
        ipMetadata: {
          ipMetadataURI: `https://ipfs.io/ipfs/${ipIpfsHash}`,
          ipMetadataHash: `0x${ipHash}`,
          nftMetadataURI: `https://ipfs.io/ipfs/${nftIpfsHash}`,
          nftMetadataHash: `0x${nftHash}`,
        },
        txOptions: { waitForTransaction: true },
      })

      return c.json({
        success: true,
        data: {
          transactionHash: response.txHash,
          ipId: response.ipId,
          tokenId: tokenId,
          explorerUrl: `${networkInfo.protocolExplorer}/ipa/${response.ipId}`,
        },
      })
    } catch (error: any) {
      console.error("Custom registration error:", error)
      return c.json(
        {
          success: false,
          error: error.message,
        },
        500,
      )
    }
  },
)

export { registrationRouter }
