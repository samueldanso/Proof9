import { zValidator } from "@hono/zod-validator"
import { Hono } from "hono"
import { Address, parseEther } from "viem"
import { z } from "zod"

import { client } from "../../../utils/config"
import { supabase } from "../../lib/supabase"

const licensesRouter = new Hono()

// Mint license tokens schema
const MintLicenseSchema = z.object({
  licensorIpId: z.string().regex(/^0x[a-fA-F0-9]{40}$/, {
    message: "IP ID must be a valid Ethereum address",
  }),
  licenseTermsId: z.string(),
  amount: z.number().int().positive().default(1),
  maxMintingFee: z.number().default(0),
  maxRevenueShare: z.number().int().min(0).max(100).default(100),
  buyer: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/, {
      message: "Buyer address must be a valid Ethereum address",
    })
    .optional(),
})

/**
 * Mint license tokens API endpoint
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
        buyer,
      } = c.req.valid("json")

      // Mint license tokens - convert WIP amount to wei using parseEther
      const response = await client.license.mintLicenseTokens({
        licenseTermsId,
        licensorIpId: licensorIpId as Address,
        amount,
        maxMintingFee: parseEther(maxMintingFee.toString()), // Convert WIP tokens to wei
        maxRevenueShare,
        txOptions: { waitForTransaction: true },
      })

      // Record the license purchase in database for earnings and library tracking
      try {
        // Find the track by IP ID to update earnings
        const { data: track } = await supabase
          .from("tracks")
          .select("id, artist_address, title")
          .eq("ip_id", licensorIpId)
          .single()

        if (track && buyer) {
          // Update track's license count and revenue
          const licensePrice = maxMintingFee || 1 // Default to 1 WIP if no fee

          // Get current values first
          const { data: currentTrack } = await supabase
            .from("tracks")
            .select("total_licenses_sold, total_revenue_earned")
            .eq("id", track.id)
            .single()

          const currentLicenses = currentTrack?.total_licenses_sold || 0
          const currentRevenue = currentTrack?.total_revenue_earned || 0

          // Update track earnings
          await supabase
            .from("tracks")
            .update({
              total_licenses_sold: currentLicenses + amount,
              total_revenue_earned: currentRevenue + licensePrice * amount,
            })
            .eq("id", track.id)

          // Record license purchase for buyer's library (create simple record)
          // Since we don't have license_transactions table, we'll create a simple user_licenses table entry
          // This would need to be created in the database schema
          try {
            await supabase.from("user_licenses").insert({
              user_address: buyer,
              track_id: track.id,
              license_token_ids: response.licenseTokenIds,
              license_terms_id: licenseTermsId,
              amount_paid: licensePrice * amount,
              transaction_hash: response.txHash,
              created_at: new Date().toISOString(),
            })
          } catch (licenseRecordError) {
            console.error(
              "Failed to record license purchase:",
              licenseRecordError,
            )
            // Don't fail if license record fails - the blockchain transaction succeeded
          }
        }
      } catch (dbError) {
        console.error("Failed to update track earnings:", dbError)
        // Don't fail the license mint if DB update fails
      }

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
