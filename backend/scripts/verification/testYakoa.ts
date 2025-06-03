import { createHash } from 'crypto'
import dotenv from 'dotenv'
import yakoaService from '../../src/services/yakoa'

// Load environment variables
dotenv.config()

/**
 * Simple test script to verify the Yakoa API connection
 * This registers a sample token and retrieves its status
 */
const main = async function () {
    try {
        console.log('Testing Yakoa API connection...')

        // Create a simple test token
        const timestamp = Math.floor(Date.now() / 1000)
        const tokenId = `proof9-test-${timestamp}`

        // Create a unique hash for the transaction
        const txHash = `0x${createHash('sha256').update(`${tokenId}-${timestamp}`).digest('hex')}`

        // Sample media URLs (these should be accessible for proper testing)
        const imageUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Vinyl_record.svg/1200px-Vinyl_record.svg.png'

        // Register the token
        const token = {
            id: tokenId,
            registration_tx: {
                hash: txHash,
                block_number: 0,
                timestamp: timestamp,
                chain: 'proof9',
            },
            creator_id: 'proof9-test-creator',
            metadata: {
                name: 'Test Music Asset',
                description: 'This is a test music asset for testing the Yakoa API',
            },
            media: [
                {
                    media_id: 'test-image',
                    url: imageUrl,
                },
            ],
        }

        console.log('Registering test token with Yakoa...')
        console.log('Token ID:', tokenId)
        console.log('API URL:', `${process.env.YAKOA_SUBDOMAIN}.ip-api.yakoa.io/${process.env.YAKOA_NETWORK}`)

        // Register the token
        const response = await yakoaService.registerToken(token)

        console.log('\nRegistration successful!')
        console.log('Token ID:', response.id)
        console.log('Media Status:')

        response.media.forEach((media) => {
            console.log(`- Media ID: ${media.media_id}`)
            console.log(`  Status: ${media.status}`)
            console.log(`  Infringement Check Status: ${media.infringement_check_status}`)

            if (media.external_infringements.length > 0) {
                console.log('  External Infringements:')
                media.external_infringements.forEach((inf) => {
                    console.log(`    - Brand: ${inf.brand_name}`)
                    console.log(`      Confidence: ${inf.confidence}`)
                    console.log(`      Authorized: ${inf.authorized}`)
                })
            } else {
                console.log('  No external infringements detected')
            }

            if (media.in_network_infringements.length > 0) {
                console.log('  In-Network Infringements:')
                media.in_network_infringements.forEach((inf) => {
                    console.log(`    - Token ID: ${inf.token_id}`)
                    console.log(`      Confidence: ${inf.confidence}`)
                    console.log(`      Licensed: ${inf.licensed}`)
                })
            } else {
                console.log('  No in-network infringements detected')
            }
        })

        console.log('\nWaiting a few seconds to check the status...')
        await new Promise((resolve) => setTimeout(resolve, 5000))

        console.log('\nRetrieving token status...')
        const statusResponse = await yakoaService.getToken(tokenId)

        console.log('Current infringement check status:')
        statusResponse.media.forEach((media) => {
            console.log(`- Media ID: ${media.media_id}`)
            console.log(`  Status: ${media.status}`)
            console.log(`  Infringement Check Status: ${media.infringement_check_status}`)
        })

        console.log('\nTest completed successfully!')
    } catch (error) {
        console.error('Error testing Yakoa API:', error)
    }
}

main()
