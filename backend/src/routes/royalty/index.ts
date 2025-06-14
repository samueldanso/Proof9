import { zValidator } from "@hono/zod-validator"
import { WIP_TOKEN_ADDRESS } from "@story-protocol/core-sdk"
import { Hono } from "hono"
import { Address, parseEther, toHex, zeroAddress } from "viem"
import { z } from "zod"

import { client, networkInfo } from "../../../utils/config"
import { SPGNFTContractAddress } from "../../../utils/utils"

const royaltyRouter = new Hono()

// IP ID schema
const IpIdSchema = z.string().regex(/^0x[a-fA-F0-9]{40}$/, {
  message: "IP ID must be a valid Ethereum address",
})

// Pay revenue schema
const PayRevenueSchema = z.object({
  receiverIpId: IpIdSchema,
  payerIpId: IpIdSchema.optional().default(zeroAddress as string),
  token: z.string().default(WIP_TOKEN_ADDRESS),
  amount: z.number().positive(),
  createDerivative: z
    .object({
      parentIpId: IpIdSchema,
      licenseTermsId: z.string(),
      metadata: z
        .object({
          ipMetadataURI: z.string().default("test-uri"),
          ipMetadataHash: z.string().optional(),
          nftMetadataHash: z.string().optional(),
          nftMetadataURI: z.string().default("test-nft-uri"),
        })
        .optional(),
    })
    .optional(),
})

// Claim revenue schema
const ClaimRevenueSchema = z.object({
  ancestorIpId: IpIdSchema,
  claimer: IpIdSchema.optional(),
  childIpIds: z.array(IpIdSchema).default([]),
  royaltyPolicies: z.array(z.string()).default([]),
  currencyTokens: z.array(z.string()).default([WIP_TOKEN_ADDRESS]),
})

/**
 * Pay revenue API endpoint
 * Pays royalty to an IP asset
 */
royaltyRouter.post("/pay", zValidator("json", PayRevenueSchema), async (c) => {
  try {
    const { receiverIpId, payerIpId, token, amount, createDerivative } =
      c.req.valid("json")

    let derivativeIpId = receiverIpId

    // Create derivative if requested
    if (createDerivative) {
      const { parentIpId, licenseTermsId, metadata } = createDerivative

      // Create derivative
      const childIp = await client.ipAsset.mintAndRegisterIpAndMakeDerivative({
        spgNftContract: SPGNFTContractAddress,
        derivData: {
          parentIpIds: [parentIpId as Address],
          licenseTermsIds: [licenseTermsId],
        },
        // Simple metadata for derivatives
        ipMetadata: {
          ipMetadataURI:
            metadata?.ipMetadataURI || "derivative-pay-revenue-uri",
          ipMetadataHash: toHex("derivative-pay-revenue-hash", { size: 32 }),
          nftMetadataHash: toHex("derivative-pay-revenue-nft-hash", {
            size: 32,
          }),
          nftMetadataURI:
            metadata?.nftMetadataURI || "derivative-pay-revenue-nft-uri",
        },
        txOptions: { waitForTransaction: true },
      })

      console.log("Derivative IP Asset created for royalty payment:", {
        "Transaction Hash": childIp.txHash,
        "IPA ID": childIp.ipId,
        "Parent IPA ID": parentIpId,
        "License Terms ID": licenseTermsId,
      })
      console.log(
        `View on the explorer: ${networkInfo.protocolExplorer}/ipa/${childIp.ipId}`,
      )

      derivativeIpId = childIp.ipId as string
    }

    // Pay royalty
    const payRoyalty = await client.royalty.payRoyaltyOnBehalf({
      receiverIpId: derivativeIpId as Address,
      payerIpId: payerIpId as Address,
      token: token as Address,
      amount: parseEther(amount.toString()),
      txOptions: { waitForTransaction: true },
    })

    // Return result
    return c.json({
      success: true,
      data: {
        transactionHash: payRoyalty.txHash,
        derivativeIpId: createDerivative ? derivativeIpId : undefined,
      },
    })
  } catch (error: any) {
    console.error("Pay revenue error:", error)
    return c.json(
      {
        success: false,
        error: error.message,
      },
      500,
    )
  }
})

/**
 * Claim revenue API endpoint
 * Claims revenue for an IP asset
 */
royaltyRouter.post(
  "/claim",
  zValidator("json", ClaimRevenueSchema),
  async (c) => {
    try {
      const {
        ancestorIpId,
        claimer,
        childIpIds,
        royaltyPolicies,
        currencyTokens,
      } = c.req.valid("json")

      // Claim revenue
      const response = await client.royalty.claimAllRevenue({
        ancestorIpId: ancestorIpId as Address,
        claimer: (claimer || ancestorIpId) as Address,
        childIpIds: childIpIds as Address[],
        royaltyPolicies:
          royaltyPolicies.length > 0 ? (royaltyPolicies as Address[]) : [],
        currencyTokens: currencyTokens as Address[],
      })

      // Return result
      return c.json({
        success: true,
        data: {
          claimedTokens: response.claimedTokens,
        },
      })
    } catch (error: any) {
      console.error("Claim revenue error:", error)
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

export { royaltyRouter }
