import { zValidator } from "@hono/zod-validator"
import { LicensingConfig } from "@story-protocol/core-sdk"
import { Hono } from "hono"
import { Address, toHex, zeroAddress } from "viem"
import { z } from "zod"

import { totalLicenseTokenLimitHook } from "../../../utils/abi/totalLicenseTokenLimitHook"
import {
  account,
  client,
  publicClient,
  walletClient,
} from "../../../utils/config"
import {
  SPGNFTContractAddress,
  createCommercialRemixTerms,
} from "../../../utils/utils"

const licensesRouter = new Hono()

// Schema for minting license tokens
const MintLicenseSchema = z.object({
  licensorIpId: z.string().regex(/^0x[a-fA-F0-9]{40}$/, {
    message: "IP ID must be a valid Ethereum address",
  }),
  licenseTermsId: z.string(),
  amount: z.number().int().positive().default(1),
  maxMintingFee: z.number().default(0),
  maxRevenueShare: z.number().int().min(0).max(100).default(100),
})

// Schema for creating one-time use license
const OneTimeUseLicenseSchema = z.object({
  metadata: z.object({
    ipMetadataURI: z.string().default("test-uri"),
    ipMetadataHash: z.string().optional(),
    nftMetadataHash: z.string().optional(),
    nftMetadataURI: z.string().default("test-nft-uri"),
  }),
  commercialRemixTerms: z
    .object({
      commercialRevShare: z.number().int().min(0).max(100).default(0),
      defaultMintingFee: z.number().default(0),
    })
    .default({ commercialRevShare: 0, defaultMintingFee: 0 }),
  licenseTokenLimit: z.number().int().positive().default(1),
  licenseTemplate: z
    .string()
    .default("0x2E896b0b2Fdb7457499B56AAaA4AE55BCB4Cd316"),
})

/**
 * Mint license tokens endpoint
 * Mints license tokens for an IP with specific license terms
 */
licensesRouter.post(
  "/mint",
  zValidator("json", MintLicenseSchema),
  async (c) => {
    try {
      const {
        licensorIpId,
        licenseTermsId,
        amount,
        maxMintingFee,
        maxRevenueShare,
      } = c.req.valid("json")

      // Mint license tokens
      const response = await client.license.mintLicenseTokens({
        licenseTermsId,
        licensorIpId: licensorIpId as Address,
        amount,
        maxMintingFee: BigInt(maxMintingFee),
        maxRevenueShare,
        txOptions: { waitForTransaction: true },
      })

      return c.json({
        success: true,
        data: {
          transactionHash: response.txHash,
          licenseTokenIds: response.licenseTokenIds,
        },
      })
    } catch (error: any) {
      console.error("License minting error:", error)
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
 * One-time use license endpoint
 * Creates an IP asset with a licensing configuration that limits total license tokens
 */
licensesRouter.post(
  "/one-time-use",
  zValidator("json", OneTimeUseLicenseSchema),
  async (c) => {
    try {
      const {
        metadata,
        commercialRemixTerms,
        licenseTokenLimit,
        licenseTemplate,
      } = c.req.valid("json")

      // Set up licensing config
      const licensingConfig: LicensingConfig = {
        isSet: true,
        mintingFee: BigInt(0),
        licensingHook: "0xaBAD364Bfa41230272b08f171E0Ca939bD600478", // TotalLicenseTokenLimitHook
        hookData: zeroAddress,
        commercialRevShare: 0,
        disabled: false,
        expectMinimumGroupRewardShare: 0,
        expectGroupRewardPool: zeroAddress,
      }

      // Process metadata hashes
      const ipMetadata = {
        ipMetadataURI: metadata.ipMetadataURI,
        ipMetadataHash:
          metadata.ipMetadataHash || toHex("test-metadata-hash", { size: 32 }),
        nftMetadataHash:
          metadata.nftMetadataHash ||
          toHex("test-nft-metadata-hash", { size: 32 }),
        nftMetadataURI: metadata.nftMetadataURI,
      }

      // Mint and register IP with licensing config
      const response = await client.ipAsset.mintAndRegisterIpAssetWithPilTerms({
        spgNftContract: SPGNFTContractAddress,
        licenseTermsData: [
          {
            terms: createCommercialRemixTerms(commercialRemixTerms),
            licensingConfig,
          },
        ],
        ipMetadata,
        txOptions: { waitForTransaction: true },
      })

      // Set total license token limit
      const { request } = await publicClient.simulateContract({
        address: "0xaBAD364Bfa41230272b08f171E0Ca939bD600478", // TotalLicenseTokenLimitHook
        abi: totalLicenseTokenLimitHook,
        functionName: "setTotalLicenseTokenLimit",
        args: [
          response.ipId as Address, // licensorIpId
          licenseTemplate as Address, // licenseTemplate
          response.licenseTermsIds![0], // licenseTermsId
          BigInt(licenseTokenLimit), // limit
        ],
        account: account,
      })

      // Send transaction
      const hash = await walletClient.writeContract({
        ...request,
        account: account,
      })

      // Wait for transaction to be mined
      const receipt = await publicClient.waitForTransactionReceipt({
        hash,
      })

      return c.json({
        success: true,
        data: {
          ipCreation: {
            transactionHash: response.txHash,
            ipId: response.ipId,
            licenseTermsIds: response.licenseTermsIds,
          },
          limitSetting: {
            transactionHash: hash,
            blockNumber: receipt.blockNumber,
            blockHash: receipt.blockHash,
            limit: licenseTokenLimit,
          },
        },
      })
    } catch (error: any) {
      console.error("One-time use license error:", error)
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

export { licensesRouter }
