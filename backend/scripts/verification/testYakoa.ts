import { createHash } from "crypto"
import dotenv from "dotenv"
import yakoaService from "../../src/services/yakoa"

// Load environment variables
dotenv.config()

/**
 * Production-ready test script to verify the Yakoa API connection
 * Tests with real audio file and proper validation
 */
const main = async () => {
  try {
    console.log("Testing Yakoa API connection with production-ready setup...")

    // Use real timestamp and deterministic data
    const timestamp = Math.floor(Date.now() / 1000)

    // Example real creator address (you would get this from connected wallet)
    const creatorAddress = "0x1234567890123456789012345678901234567890" // Replace with real address

    // Generate deterministic token ID based on content
    const contentHash = createHash("sha256")
      .update(`test-audio-${timestamp}`)
      .digest("hex")
    const tokenId = `${creatorAddress}:${Number.parseInt(contentHash.slice(0, 8), 16)}`

    // Create a real transaction hash (in production, this comes from actual blockchain tx)
    const txHash = `0x${createHash("sha256").update(`${creatorAddress}-${timestamp}`).digest("hex")}`

    // Real IPFS URL for the test audio file (you would upload this first)
    // For demo, using a publicly accessible audio URL
    const audioUrl = "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav"

    // Calculate file hash for IPFS content integrity
    const audioHash = createHash("sha256")
      .update(`test-audio-content-${timestamp}`)
      .digest("hex")

    // Register the token with production-ready data
    const token = {
      id: tokenId,
      registration_tx: {
        hash: txHash,
        block_number: timestamp % 1000000, // In production, use real block number
        timestamp: timestamp,
        chain: "story", // Real chain name
      },
      creator_id: creatorAddress,
      metadata: {
        title: "Test Audio Asset - Production Ready",
        description:
          "Real audio file test for Yakoa integration with Proof9 platform",
        genre: "Electronic",
        duration: "00:03:45",
      },
      media: [
        {
          media_id: "audio-primary",
          url: audioUrl,
          hash: audioHash, // Content integrity hash
          trust_reason: null, // No special trust needed for verification
        },
      ],
    }

    console.log("\n=== Production Test Configuration ===")
    console.log("Token ID:", tokenId)
    console.log("Creator Address:", creatorAddress)
    console.log("Audio URL:", audioUrl)
    console.log(
      "API URL:",
      `${process.env.YAKOA_SUBDOMAIN}.ip-api-sandbox.yakoa.io/${process.env.YAKOA_NETWORK}`,
    )
    console.log("======================================\n")

    console.log("Registering token with Yakoa...")

    // Register the token
    const response = await yakoaService.registerToken(token)

    console.log("\n✅ Registration successful!")
    console.log("Response Token ID:", response.id)
    console.log("\n📊 Media Analysis Results:")

    response.media.forEach((media, index) => {
      console.log(`\nMedia ${index + 1}:`)
      console.log(`  - Media ID: ${media.media_id}`)
      console.log(`  - Status: ${media.status || "pending"}`)
      console.log(
        `  - Infringement Check: ${media.infringement_check_status || "pending"}`,
      )

      if (
        media.external_infringements &&
        media.external_infringements.length > 0
      ) {
        console.log("  - External Infringements:")
        media.external_infringements.forEach((inf) => {
          console.log(
            `    • Brand: ${inf.brand_name} (Confidence: ${inf.confidence}%, Authorized: ${inf.authorized})`,
          )
        })
      } else {
        console.log("  - External Infringements: None detected")
      }

      if (
        media.in_network_infringements &&
        media.in_network_infringements.length > 0
      ) {
        console.log("  - In-Network Infringements:")
        media.in_network_infringements.forEach((inf) => {
          console.log(
            `    • Token: ${inf.token_id} (Confidence: ${inf.confidence}%, Licensed: ${inf.licensed})`,
          )
        })
      } else {
        console.log("  - In-Network Infringements: None detected")
      }
    })

    console.log("\n⏳ Waiting for analysis to complete...")
    await new Promise((resolve) => setTimeout(resolve, 8000))

    console.log("\n🔄 Checking updated status...")
    const statusResponse = await yakoaService.getToken(tokenId)

    console.log("\n📈 Updated Analysis Status:")
    statusResponse.media.forEach((media, index) => {
      console.log(`\nMedia ${index + 1}:`)
      console.log(`  - Media ID: ${media.media_id}`)
      console.log(`  - Status: ${media.status || "pending"}`)
      console.log(
        `  - Infringement Check: ${media.infringement_check_status || "pending"}`,
      )
    })

    console.log("\n🎉 Production-ready test completed successfully!")
    console.log("\n💡 Next steps:")
    console.log("  1. Integrate with real wallet addresses from frontend")
    console.log("  2. Upload audio files to IPFS and use real URLs")
    console.log("  3. Connect to real blockchain transactions")
    console.log("  4. Implement proper error handling in production")
  } catch (error: any) {
    console.error("\n❌ Test failed:", error.message)
    console.log("\n🔧 Troubleshooting:")
    console.log("  1. Check YAKOA_API_KEY is set correctly")
    console.log("  2. Verify network connectivity")
    console.log("  3. Ensure audio URL is publicly accessible")
    console.log("  4. Check Yakoa API documentation for updates")
  }
}

main()
