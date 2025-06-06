import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { createHash } from 'crypto'

// Create router
const app = new Hono()

// File upload schema
const FileUploadSchema = z.object({
    fileName: z.string(),
    fileType: z.string(),
    fileSize: z.number(),
    fileData: z.string(), // Base64 encoded file data
})

// Metadata upload schema
const MetadataUploadSchema = z.object({
    title: z.string(),
    description: z.string(),
    genre: z.string(),
    tags: z.array(z.string()),
    duration: z.string().optional(),
})

/**
 * Upload audio file
 * For now, simulate file upload - in production would upload to IPFS
 */
app.post('/audio', zValidator('json', FileUploadSchema), async (c) => {
    try {
        const { fileName, fileType, fileSize, fileData } = c.req.valid('json')

        // Validate file type
        const allowedTypes = ['audio/mp3', 'audio/wav', 'audio/mpeg']
        if (!allowedTypes.includes(fileType)) {
            return c.json(
                {
                    success: false,
                    error: 'Invalid file type. Only MP3 and WAV files are allowed.',
                },
                400
            )
        }

        // Validate file size (100MB limit)
        const maxSize = 100 * 1024 * 1024 // 100MB
        if (fileSize > maxSize) {
            return c.json(
                {
                    success: false,
                    error: 'File size too large. Maximum size is 100MB.',
                },
                400
            )
        }

        // Generate file hash for verification
        const fileHash = createHash('sha256').update(fileData).digest('hex')

        // Simulate IPFS upload
        const ipfsHash = `Qm${fileHash.substring(0, 44)}`
        const ipfsUrl = `https://ipfs.io/ipfs/${ipfsHash}`

        return c.json({
            success: true,
            data: {
                fileName,
                fileType,
                fileSize,
                fileHash,
                ipfsHash,
                ipfsUrl,
                uploadedAt: new Date().toISOString(),
            },
        })
    } catch (error: any) {
        console.error('Audio upload error:', error)
        return c.json(
            {
                success: false,
                error: error.message,
            },
            500
        )
    }
})

/**
 * Upload metadata to IPFS
 * Prepares metadata for Story Protocol registration
 */
app.post('/metadata', zValidator('json', MetadataUploadSchema), async (c) => {
    try {
        const metadata = c.req.valid('json')

        // Create Story Protocol compatible metadata
        const ipMetadata = {
            title: metadata.title,
            description: metadata.description,
            genre: metadata.genre,
            tags: metadata.tags,
            duration: metadata.duration,
            createdAt: new Date().toISOString(),
        }

        // Generate metadata hash
        const metadataHash = createHash('sha256').update(JSON.stringify(ipMetadata)).digest('hex')

        // Simulate IPFS upload
        const ipfsHash = `Qm${metadataHash.substring(0, 44)}`
        const ipfsUrl = `https://ipfs.io/ipfs/${ipfsHash}`

        return c.json({
            success: true,
            data: {
                metadata: ipMetadata,
                metadataHash,
                ipfsHash,
                ipfsUrl,
                uploadedAt: new Date().toISOString(),
            },
        })
    } catch (error: any) {
        console.error('Metadata upload error:', error)
        return c.json(
            {
                success: false,
                error: error.message,
            },
            500
        )
    }
})

export default app
