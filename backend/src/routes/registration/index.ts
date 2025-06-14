import { createHash } from "node:crypto"
import { zValidator } from "@hono/zod-validator"
import { IpMetadata } from "@story-protocol/core-sdk"
import { Hono } from "hono"
import { z } from "zod"

import { client, networkInfo } from "../../../utils/config"
import { uploadJSONToIPFS } from "../../../utils/functions/uploadToIpfs"
import {
  SPGNFTContractAddress,
  createCommercialRemixTerms,
} from "../../../utils/utils"

const registrationRouter = new Hono()

// Music registration schema
const MusicRegistrationSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),

  creators: z
    .array(
      z.object({
        name: z.string().min(1, "Creator name is required"),
        address: z
          .string()
          .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address"),
        contributionPercent: z.number().int().min(1).max(100),
        description: z.string().optional(),
        socialMedia: z
          .array(
            z.object({
              platform: z.string(),
              url: z.string().url(),
            }),
          )
          .optional(),
      }),
    )
    .min(1, "At least one creator is required"),

  image: z.string().url("Invalid image URL"),
  imageHash: z.string().min(1, "Image hash is required"),

  mediaUrl: z.string().url("Invalid media URL"),
  mediaHash: z.string().min(1, "Media hash is required"),
  mediaType: z.string().min(1, "Media type is required"),

  // NFT Metadata (ERC-721 Standard)
  nftName: z.string().optional(),
  nftDescription: z.string().optional(),
  attributes: z
    .array(
      z.object({
        key: z.string(),
        value: z.string(),
      }),
    )
    .optional(),

  // License Terms
  commercialRemixTerms: z
    .object({
      defaultMintingFee: z.number().default(1),
      commercialRevShare: z.number().int().min(0).max(100).default(5),
    })
    .optional(),
})

// Register music as IP Asset
registrationRouter.post(
  "/register",
  zValidator("json", MusicRegistrationSchema),
  async (c) => {
    try {
      const requestData = c.req.valid("json")

      // Set up IP Metadata
      const ipMetadata: IpMetadata = client.ipAsset.generateIpMetadata({
        title: requestData.title,
        description: requestData.description,
        createdAt: Math.floor(Date.now() / 1000).toString(),
        creators: requestData.creators.map((creator) => ({
          name: creator.name,
          address: creator.address as `0x${string}`,
          contributionPercent: creator.contributionPercent,
          ...(creator.description && { description: creator.description }),
          ...(creator.socialMedia && { socialMedia: creator.socialMedia }),
        })),
        // Cover art (image.* fields)
        image: requestData.image,
        imageHash: (requestData.imageHash.startsWith("0x")
          ? requestData.imageHash
          : `0x${requestData.imageHash}`) as `0x${string}`,
        // Audio file (media.* fields - checked for infringement)
        mediaUrl: requestData.mediaUrl,
        mediaHash: (requestData.mediaHash.startsWith("0x")
          ? requestData.mediaHash
          : `0x${requestData.mediaHash}`) as `0x${string}`,
        mediaType: requestData.mediaType,
      })

      // Set up NFT Metadata
      const nftMetadata = {
        name: requestData.nftName || requestData.title,
        description:
          requestData.nftDescription ||
          `${requestData.description} This NFT represents ownership of the IP Asset.`,
        image: requestData.image,
        animation_url: requestData.mediaUrl,
        attributes: requestData.attributes || [
          {
            key: "Platform",
            value: "Proof9",
          },
          {
            key: "Creator",
            value: requestData.creators[0]?.name || "Unknown",
          },
          {
            key: "Creators Count",
            value: requestData.creators.length.toString(),
          },
          ...requestData.creators.map((creator, index) => ({
            key: `Creator ${index + 1}`,
            value: `${creator.name} (${creator.contributionPercent}%)`,
          })),
        ],
      }

      // Upload IP and NFT Metadata to IPFS
      const ipIpfsHash = await uploadJSONToIPFS(ipMetadata)
      const ipHash = createHash("sha256")
        .update(JSON.stringify(ipMetadata))
        .digest("hex")
      const nftIpfsHash = await uploadJSONToIPFS(nftMetadata)
      const nftHash = createHash("sha256")
        .update(JSON.stringify(nftMetadata))
        .digest("hex")

      // Register the NFT as an IP Asset with PIL Terms
      const commercialTerms = requestData.commercialRemixTerms || {
        defaultMintingFee: 1,
        commercialRevShare: 5,
      }

      const response = await client.ipAsset.mintAndRegisterIpAssetWithPilTerms({
        spgNftContract: SPGNFTContractAddress,
        licenseTermsData: [
          {
            terms: createCommercialRemixTerms(commercialTerms),
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

      console.log("Music IP Asset registered:", {
        "Transaction Hash": response.txHash,
        "IPA ID": response.ipId,
        "License Terms IDs": response.licenseTermsIds,
      })
      console.log(
        `View on the explorer: ${networkInfo.protocolExplorer}/ipa/${response.ipId}`,
      )

      return c.json({
        success: true,
        data: {
          transactionHash: response.txHash,
          ipId: response.ipId,
          tokenId: response.tokenId?.toString(),
          licenseTermsIds:
            response.licenseTermsIds?.map((id) => id.toString()) || [],
          explorerUrl: `${networkInfo.protocolExplorer}/ipa/${response.ipId}`,
          ipMetadata,
          nftMetadata,
        },
      })
    } catch (error: any) {
      console.error("Music registration error:", error)
      return c.json(
        {
          success: false,
          error: error.message,
          details: error.stack,
        },
        500,
      )
    }
  },
)

export { registrationRouter }
