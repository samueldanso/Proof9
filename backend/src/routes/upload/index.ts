import { createHash } from "node:crypto"
import { zValidator } from "@hono/zod-validator"
import { Hono } from "hono"
import { z } from "zod"
import {
  uploadBinaryToIPFS,
  uploadJSONToIPFS,
} from "../../../utils/functions/uploadToIpfs"

// Create router
const uploadRouter = new Hono()

// Story Protocol naming - Media upload schema
const MediaUploadSchema = z.object({
  mediaName: z.string(),
  mediaType: z.string(),
  mediaSize: z.number(),
  mediaData: z.string(), // Base64 encoded media content
})

// Story Protocol naming - Image upload schema
const ImageUploadSchema = z.object({
  imageName: z.string(),
  imageType: z.string(),
  imageSize: z.number(),
  imageData: z.string(), // Base64 encoded image content
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
 * Generate content hash using Story Protocol's recommended approach
 * Story uses SHA-256 hash of file content, returned as hex string with 0x prefix
 */
function generateContentHash(content: Buffer): string {
  const hash = createHash("sha256").update(content).digest("hex")
  return `0x${hash}`
}

/**
 * Upload media file (audio)
 * Returns mediaUrl and mediaHash following Story Protocol naming
 */
uploadRouter.post(
  "/audio",
  zValidator("json", MediaUploadSchema),
  async (c) => {
    try {
      const { mediaName, mediaType, mediaSize, mediaData } = c.req.valid("json")

      // Validate file type
      const allowedTypes = [
        "audio/mp3",
        "audio/wav",
        "audio/mpeg",
        "audio/flac",
      ]
      if (!allowedTypes.includes(mediaType)) {
        return c.json(
          {
            success: false,
            error:
              "Invalid file type. Only MP3, WAV, and FLAC files are allowed.",
          },
          400,
        )
      }

      // Validate file size (100MB limit)
      const maxSize = 100 * 1024 * 1024 // 100MB
      if (mediaSize > maxSize) {
        return c.json(
          {
            success: false,
            error: "File size too large. Maximum size is 100MB.",
          },
          400,
        )
      }

      // Convert base64 to buffer
      const mediaBuffer = Buffer.from(mediaData, "base64")

      // Generate Story Protocol compliant content hash
      const mediaHash = generateContentHash(mediaBuffer)

      // Upload media to IPFS using Pinata
      const ipfsHash = await uploadBinaryToIPFS(
        mediaBuffer,
        mediaName,
        mediaType,
      )
      const mediaUrl = `https://ipfs.io/ipfs/${ipfsHash}`

      return c.json({
        success: true,
        data: {
          mediaName,
          mediaType,
          mediaSize,
          // Story Protocol naming ONLY
          mediaUrl,
          mediaHash,
          uploadedAt: new Date().toISOString(),
        },
      })
    } catch (error: any) {
      console.error("Media upload error:", error)
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
 * Upload avatar image
 */
uploadRouter.post(
  "/avatar",
  zValidator("json", MediaUploadSchema),
  async (c) => {
    try {
      const { mediaName, mediaType, mediaSize, mediaData } = c.req.valid("json")

      // Validate file type
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
      ]
      if (!allowedTypes.includes(mediaType)) {
        return c.json(
          {
            success: false,
            error:
              "Invalid file type. Only JPEG, PNG, and WebP images are allowed.",
          },
          400,
        )
      }

      // Validate file size (5MB limit for avatars)
      const maxSize = 5 * 1024 * 1024 // 5MB
      if (mediaSize > maxSize) {
        return c.json(
          {
            success: false,
            error: "File size too large. Maximum size is 5MB.",
          },
          400,
        )
      }

      // Convert base64 to buffer
      const imageBuffer = Buffer.from(mediaData, "base64")

      // Generate Story Protocol compliant content hash
      const imageHash = generateContentHash(imageBuffer)

      // Upload image to IPFS using Pinata
      const ipfsHash = await uploadBinaryToIPFS(
        imageBuffer,
        mediaName,
        mediaType,
      )

      const avatarUrl = `https://ipfs.io/ipfs/${ipfsHash}`

      return c.json({
        success: true,
        data: {
          mediaName,
          mediaType,
          mediaSize,
          avatarUrl,
          // Story Protocol naming for images
          imageHash,
          uploadedAt: new Date().toISOString(),
        },
      })
    } catch (error: any) {
      console.error("Avatar upload error:", error)
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
 * Upload cover art image
 * Returns image and imageHash following Story Protocol naming
 */
uploadRouter.post(
  "/cover-art",
  zValidator("json", ImageUploadSchema),
  async (c) => {
    try {
      const { imageName, imageType, imageSize, imageData } = c.req.valid("json")

      // Validate file type
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
        "image/gif",
      ]
      if (!allowedTypes.includes(imageType)) {
        return c.json(
          {
            success: false,
            error:
              "Invalid file type. Only JPEG, PNG, WebP, and GIF images are allowed.",
          },
          400,
        )
      }

      // Validate file size (10MB limit for cover art)
      const maxSize = 10 * 1024 * 1024 // 10MB
      if (imageSize > maxSize) {
        return c.json(
          {
            success: false,
            error: "File size too large. Maximum size is 10MB.",
          },
          400,
        )
      }

      // Convert base64 to buffer
      const imageBuffer = Buffer.from(imageData, "base64")

      // Generate Story Protocol compliant content hash
      const imageHash = generateContentHash(imageBuffer)

      // Upload image to IPFS using Pinata
      const ipfsHash = await uploadBinaryToIPFS(
        imageBuffer,
        imageName,
        imageType,
      )
      const image = `https://ipfs.io/ipfs/${ipfsHash}`

      return c.json({
        success: true,
        data: {
          imageName,
          imageType,
          imageSize,
          // Story Protocol naming ONLY
          image,
          imageHash,
          uploadedAt: new Date().toISOString(),
        },
      })
    } catch (error: any) {
      console.error("Cover art upload error:", error)
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
 * Upload metadata to IPFS
 * Prepares metadata for Story Protocol registration
 */
uploadRouter.post(
  "/metadata",
  zValidator("json", MetadataUploadSchema),
  async (c) => {
    try {
      const metadata = c.req.valid("json")

      // Create Story Protocol compatible metadata
      const ipMetadata = {
        title: metadata.title,
        description: metadata.description,
        genre: metadata.genre,
        tags: metadata.tags,
        duration: metadata.duration,
        createdAt: Math.floor(Date.now() / 1000).toString(), // Unix timestamp as string
      }

      // Generate metadata hash using Story Protocol approach
      const metadataHash = createHash("sha256")
        .update(JSON.stringify(ipMetadata))
        .digest("hex")

      // Upload metadata to IPFS using Pinata
      const ipfsHash = await uploadJSONToIPFS(ipMetadata)
      const ipfsUrl = `https://ipfs.io/ipfs/${ipfsHash}`

      return c.json({
        success: true,
        data: {
          metadata: ipMetadata,
          metadataHash: `0x${metadataHash}`,
          ipfsHash,
          ipfsUrl,
          uploadedAt: new Date().toISOString(),
        },
      })
    } catch (error: any) {
      console.error("Metadata upload error:", error)
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

export { uploadRouter }
