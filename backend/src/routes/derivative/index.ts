import { zValidator } from "@hono/zod-validator"
import { IpMetadata } from "@story-protocol/core-sdk"
import { Hono } from "hono"
import { Address, toHex } from "viem"
import { z } from "zod"

import { client, networkInfo } from "../../../utils/config"
import { uploadJSONToIPFS } from "../../../utils/functions/uploadToIpfs"
import { SPGNFTContractAddress } from "../../../utils/utils"

const derivativeRouter = new Hono()

// Register derivative schema
const RegisterDerivativeSchema = z.object({
  parentIpId: z.string().regex(/^0x[a-fA-F0-9]{40}$/, {
    message: "Parent IP ID must be a valid Ethereum address",
  }),
  licenseTermsId: z.string(),
  ipMetadata: z.object({
    title: z.string(),
    description: z.string(),
    creators: z.array(
      z.object({
        name: z.string(),
        address: z.string(),
        contributionPercent: z.number().int().min(1).max(100),
      }),
    ),
    image: z.string().url(),
    mediaUrl: z.string().url().optional(),
    mediaType: z.string().optional(),
  }),
  nftMetadata: z.object({
    name: z.string(),
    description: z.string(),
    image: z.string().url(),
    animation_url: z.string().url().optional(),
    attributes: z
      .array(
        z.object({
          key: z.string(),
          value: z.string(),
        }),
      )
      .optional(),
  }),
})

// Schema for getting derivative relationships
const IpIdSchema = z.string().regex(/^0x[a-fA-F0-9]{40}$/, {
  message: "IP ID must be a valid Ethereum address",
})

/**
 * Register a derivative IP Asset (remix, cover, sample)
 * This is the main endpoint for creators who want to create remixes/covers
 */
derivativeRouter.post(
  "/register",
  zValidator("json", RegisterDerivativeSchema),
  async (c) => {
    try {
      const { parentIpId, licenseTermsId, ipMetadata, nftMetadata } =
        c.req.valid("json")

      // Upload metadata to IPFS
      const ipIpfsHash = await uploadJSONToIPFS(ipMetadata)
      const ipHash = toHex(JSON.stringify(ipMetadata), { size: 32 })
      const nftIpfsHash = await uploadJSONToIPFS(nftMetadata)
      const nftHash = toHex(JSON.stringify(nftMetadata), { size: 32 })

      // Register derivative using Story Protocol
      const response = await client.ipAsset.mintAndRegisterIpAndMakeDerivative({
        spgNftContract: SPGNFTContractAddress,
        derivData: {
          parentIpIds: [parentIpId as Address],
          licenseTermsIds: [licenseTermsId],
        },
        ipMetadata: {
          ipMetadataURI: `https://gateway.pinata.cloud/ipfs/${ipIpfsHash}`,
          ipMetadataHash: ipHash,
          nftMetadataURI: `https://gateway.pinata.cloud/ipfs/${nftIpfsHash}`,
          nftMetadataHash: nftHash,
        },
        txOptions: { waitForTransaction: true },
      })

      console.log("Derivative IP Asset registered:", {
        "Transaction Hash": response.txHash,
        "IPA ID": response.ipId,
        "Parent IPA ID": parentIpId,
        "License Terms ID": licenseTermsId,
      })
      console.log(
        `View on the explorer: ${networkInfo.protocolExplorer}/ipa/${response.ipId}`,
      )

      return c.json({
        success: true,
        data: {
          transactionHash: response.txHash,
          ipId: response.ipId,
          tokenId: response.tokenId,
          parentIpId,
          licenseTermsId,
          ipMetadataHash: ipHash,
          nftMetadataHash: nftHash,
          ipMetadataURI: `https://gateway.pinata.cloud/ipfs/${ipIpfsHash}`,
          nftMetadataURI: `https://gateway.pinata.cloud/ipfs/${nftIpfsHash}`,
          explorerUrl: `${networkInfo.protocolExplorer}/ipa/${response.ipId}`,
        },
      })
    } catch (error) {
      console.error("Derivative registration error:", error)
      return c.json(
        {
          success: false,
          error: "Failed to register derivative IP asset",
        },
        500,
      )
    }
  },
)

/**
 * Get all derivatives (remixes/covers) of a parent track
 */
derivativeRouter.get(
  "/children/:parentIpId",
  zValidator("param", z.object({ parentIpId: IpIdSchema })),
  async (c) => {
    try {
      const { parentIpId } = c.req.valid("param")

      // Note: Story Protocol doesn't provide a direct API to get derivatives
      // This would need to be implemented by indexing events or using a graph
      // For now, return a placeholder response
      return c.json({
        success: true,
        data: {
          parentIpId,
          derivatives: [],
          message:
            "Derivative indexing not yet implemented - requires event indexing",
        },
      })
    } catch (error) {
      console.error("Get derivatives error:", error)
      return c.json(
        {
          success: false,
          error: "Failed to get derivative tracks",
        },
        500,
      )
    }
  },
)

/**
 * Get parent tracks that this derivative is based on
 */
derivativeRouter.get(
  "/parents/:derivativeIpId",
  zValidator("param", z.object({ derivativeIpId: IpIdSchema })),
  async (c) => {
    try {
      const { derivativeIpId } = c.req.valid("param")

      // Note: Story Protocol doesn't provide a direct API to get parents
      // This would need to be implemented by indexing events or using a graph
      // For now, return a placeholder response
      return c.json({
        success: true,
        data: {
          derivativeIpId,
          parents: [],
          message:
            "Parent indexing not yet implemented - requires event indexing",
        },
      })
    } catch (error) {
      console.error("Get parents error:", error)
      return c.json(
        {
          success: false,
          error: "Failed to get parent tracks",
        },
        500,
      )
    }
  },
)

/**
 * Check if user can create a derivative of a track
 * This checks license terms and requirements
 */
derivativeRouter.get(
  "/can-remix/:parentIpId",
  zValidator("param", z.object({ parentIpId: IpIdSchema })),
  async (c) => {
    try {
      const { parentIpId } = c.req.valid("param")

      // Note: This would need to check the license terms attached to the parent IP
      // For now, return a basic response
      return c.json({
        success: true,
        data: {
          canRemix: true,
          licenseTermsId: "1", // Default non-commercial terms
          requirements: {
            attribution: true,
            commercialUse: false,
            revenueShare: 0,
            mintingFee: 0,
          },
          message:
            "License checking not fully implemented - using default terms",
        },
      })
    } catch (error) {
      console.error("Check remix permissions error:", error)
      return c.json(
        {
          success: false,
          error: "Failed to check remix permissions",
        },
        500,
      )
    }
  },
)

export { derivativeRouter }
