import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'
import { cors } from 'hono/cors'
import { env } from './config/env'

// Import routes
import registrationRoutes from './routes/registration'
import derivativeRoutes from './routes/derivative'
import disputeRoutes from './routes/dispute'
import licenseRoutes from './routes/licenses'
import royaltyRoutes from './routes/royalty'
import miscRoutes from './routes/misc'
import verificationRoutes from './routes/verification'

// Import new frontend routes
import tracksRoutes from './routes/tracks'
import usersRoutes from './routes/users'
import uploadRoutes from './routes/upload'

// Create Hono app
const app = new Hono()

// Middleware
app.use('*', logger())
app.use('*', prettyJSON())
app.use('*', cors())

// Error handling middleware
app.onError((err, c) => {
    console.error(`Error: ${err.message}`)
    return c.json(
        {
            success: false,
            error: err.message,
            stack: env.NODE_ENV === 'development' ? err.stack : undefined,
        },
        500
    )
})

// Routes
app.route('/api/registration', registrationRoutes)
app.route('/api/derivative', derivativeRoutes)
app.route('/api/dispute', disputeRoutes)
app.route('/api/licenses', licenseRoutes)
app.route('/api/royalty', royaltyRoutes)
app.route('/api/misc', miscRoutes)
app.route('/api/verification', verificationRoutes)

// New frontend-focused routes
app.route('/api/tracks', tracksRoutes)
app.route('/api/users', usersRoutes)
app.route('/api/upload', uploadRoutes)

// Default route
app.get('/', (c) => {
    return c.json({
        message: 'Proof9 API Server',
        version: '1.0.0',
        description: 'Story Protocol + Frontend Integration API',
        environment: env.NODE_ENV,
        network: env.STORY_NETWORK,
        endpoints: {
            story_protocol: [
                '/api/registration',
                '/api/derivative',
                '/api/dispute',
                '/api/licenses',
                '/api/royalty',
                '/api/misc',
                '/api/verification',
            ],
            frontend: ['/api/tracks', '/api/users', '/api/upload'],
        },
    })
})

// Start server
console.log(`🎵 Proof9 API Server running on port ${env.PORT}`)
console.log(`📡 Environment: ${env.NODE_ENV}`)
console.log(`🔗 Network: ${env.STORY_NETWORK}`)

export default {
    port: env.PORT,
    fetch: app.fetch,
}
