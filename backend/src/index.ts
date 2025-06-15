import { Hono } from "hono"
import { bodyLimit } from "hono/body-limit"
import { cors } from "hono/cors"
import { errorHandler } from "./middleware/error"
import * as routes from "./routes"

const app = new Hono()

// Middleware
app.use("*", cors({ origin: "*" }))
app.use("*", bodyLimit({ maxSize: 100 * 1024 * 1024 }))

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

// Routes
app.route("/api/registration", routes.registrationRouter)
app.route("/api/licenses", routes.licensesRouter)
app.route("/api/royalty", routes.royaltyRouter)
app.route("/api/verification", routes.verificationRouter)
app.route("/api/derivative", routes.derivativeRouter)
app.route("/api/tracks", routes.tracksRouter)
app.route("/api/users", routes.usersRouter)
app.route("/api/upload", routes.uploadRouter)

const port = process.env.PORT || 3001
console.log(`🚀 Server running on port ${port}`)

export default {
  port,
  fetch: app.fetch,
}
