import { createHash } from 'crypto'
import { IpMetadata } from '@story-protocol/core-sdk'

import { client, account, networkInfo } from '../../utils/config'
import { createCommercialRemixTerms, SPGNFTContractAddress } from '../../utils/utils'
import { uploadJSONToIPFS } from '../../utils/functions/uploadToIpfs'
import { verifyMusicContent } from '../../utils/functions/verifySound'

/**
 * Verify music content with Yakoa and then register with Story Protocol
 * This is a demo script showing the full flow from verification to registration
 */
const main = async function () {
    try {
        // Sample music data
        const title = 'Midnight Symphony'
        const description = 'An original electronic music composition'
        const creatorId = account.address
        const mediaUrl = 'https://example.com/music/midnight-symphony.mp3'
        const imageUrl = 'https://example.com/images/midnight-symphony-cover.jpg'
        const metadata = {
            genre: 'Electronic',
            bpm: 128,
            key: 'C Minor',
            duration: '3:45',
            tags: ['electronic', 'ambient', 'original'],
        }

        console.log('Step 1: Verifying music content with Yakoa...')

        // Verify music content with Yakoa
        const verificationResult = await verifyMusicContent(title, description, creatorId, mediaUrl, imageUrl, metadata)

        console.log('Verification Result:', JSON.stringify(verificationResult, null, 2))

        // Check if there are any infringements or issues
        const hasInfringements = verificationResult.verificationStatus.some((status) => {
            return status.externalInfringements.length > 0 || status.inNetworkInfringements.length > 0
        })

        if (hasInfringements) {
            console.log('Potential infringements detected! Aborting registration.')
            console.log('Please review the verification results and resolve any issues.')
            return
        }

        console.log('No infringements detected, proceeding with registration...')
        console.log('Step 2: Preparing metadata for Story Protocol...')

        // Generate 0x-prefixed hashes for Story Protocol
        const imageHash = `0x${createHash('sha256').update(imageUrl).digest('hex')}`
        const mediaHash = `0x${createHash('sha256').update(mediaUrl).digest('hex')}`

        // Set up IP Metadata for Story Protocol
        const ipMetadata: IpMetadata = client.ipAsset.generateIpMetadata({
            title,
            description,
            createdAt: Math.floor(Date.now() / 1000).toString(),
            creators: [
                {
                    name: 'Creator',
                    address: creatorId,
                    contributionPercent: 100,
                },
            ],
            image: imageUrl,
            imageHash: imageHash as `0x${string}`,
            mediaUrl,
            mediaHash: mediaHash as `0x${string}`,
            mediaType: 'audio/mpeg',
        })

        // Set up NFT Metadata
        const nftMetadata = {
            name: title,
            description: `${description}. This NFT represents ownership of the IP Asset.`,
            image: imageUrl,
            animation_url: mediaUrl,
            attributes: [
                {
                    key: 'Yakoa Verified',
                    value: 'Yes',
                },
                {
                    key: 'Yakoa Token ID',
                    value: verificationResult.tokenId,
                },
                ...Object.entries(metadata).map(([key, value]) => ({
                    key,
                    value: String(value),
                })),
            ],
        }

        console.log('Step 3: Uploading metadata to IPFS...')

        // Upload metadata to IPFS
        const ipIpfsHash = await uploadJSONToIPFS(ipMetadata)
        const ipHash = createHash('sha256').update(JSON.stringify(ipMetadata)).digest('hex')
        const nftIpfsHash = await uploadJSONToIPFS(nftMetadata)
        const nftHash = createHash('sha256').update(JSON.stringify(nftMetadata)).digest('hex')

        console.log('Step 4: Registering with Story Protocol...')

        // Register the NFT as an IP Asset
        const response = await client.ipAsset.mintAndRegisterIpAssetWithPilTerms({
            spgNftContract: SPGNFTContractAddress,
            licenseTermsData: [
                {
                    terms: createCommercialRemixTerms({ defaultMintingFee: 1, commercialRevShare: 5 }),
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

        console.log('Successfully verified and registered!', {
            'Yakoa Token ID': verificationResult.tokenId,
            'Story Transaction Hash': response.txHash,
            'Story IPA ID': response.ipId,
            'License Terms IDs': response.licenseTermsIds,
        })
        console.log(`View on the explorer: ${networkInfo.protocolExplorer}/ipa/${response.ipId}`)
    } catch (error) {
        console.error('Error in verify and register flow:', error)
    }
}

main()
