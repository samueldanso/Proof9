import { zValidator } from "@hono/zod-validator"
import { Hono } from "hono"
import { Address } from "viem"
import { z } from "zod"

import { client } from "../../../utils/config"

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

export { licensesRouter }
