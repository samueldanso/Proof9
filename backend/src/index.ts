import { Hono } from "hono"
import { bodyLimit } from "hono/body-limit"
import { cors } from "hono/cors"
import { logger } from "hono/logger"
import { prettyJSON } from "hono/pretty-json"
import env from "./env"
import { errorHandler } from "./middleware/error"

import { licensesRouter } from "./routes/licenses"
import { registrationRouter } from "./routes/registration"
import { royaltyRouter } from "./routes/royalty"
import { tracksRouter } from "./routes/tracks"
import { uploadRouter } from "./routes/upload"
import { usersRouter } from "./routes/users"
import { verificationRouter } from "./routes/verification"

const app = new Hono()

// Middleware
app.use("*", cors({ origin: "*" }))
app.use("*", logger())
app.use("*", prettyJSON())
app.use("*", bodyLimit({ maxSize: 100 * 1024 * 1024 })) // 100MB for audio files

// Error handling
app.onError(errorHandler)

// Health check endpoint
app.get("/health", (c) => {
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  })
})

// Routes - Core Story Protocol Integration
app.route("/api/registration", registrationRouter)
app.route("/api/licenses", licensesRouter)
app.route("/api/royalty", royaltyRouter)
app.route("/api/verification", verificationRouter)

// Routes - Frontend Support
app.route("/api/tracks", tracksRouter)
app.route("/api/users", usersRouter)
app.route("/api/upload", uploadRouter)

// API info route
app.get("/", (c) => {
  return c.json({
    message: "Proof9 API Server",
    version: "1.0.0",
    description:
      "Core backend for music IP protection, verification, and licensing",
    endpoints: {
      core_features: [
        "/api/registration",
        "/api/licenses",
        "/api/royalty",
        "/api/verification",
      ],
      frontend_support: ["/api/tracks", "/api/users", "/api/upload"],
    },
    integrations: {
      "Story Protocol": "IP registration and licensing",
      Yakoa: "Music verification and originality checking",
      IPFS: "Decentralized metadata storage",
    },
  })
})

// Startup logging
console.log(`🎵 Proof9 API Server starting on port ${env.PORT}`)

export default {
  port: env.PORT,
  fetch: app.fetch,
}
