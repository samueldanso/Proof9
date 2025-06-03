import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'
import { cors } from 'hono/cors'
import dotenv from 'dotenv'

// Import routes
import registrationRoutes from './routes/registration'
import derivativeRoutes from './routes/derivative'
import disputeRoutes from './routes/dispute'
import licenseRoutes from './routes/licenses'
import royaltyRoutes from './routes/royalty'
import miscRoutes from './routes/misc'
import verificationRoutes from './routes/verification'

// Load environment variables
dotenv.config()

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
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
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

// Default route
app.get('/', (c) => {
    return c.json({
        message: 'Story Protocol API Server',
        version: '1.0.0',
        endpoints: [
            '/api/registration',
            '/api/derivative',
            '/api/dispute',
            '/api/licenses',
            '/api/royalty',
            '/api/misc',
            '/api/verification',
        ],
    })
})

// Start server
const port = parseInt(process.env.PORT || '3000')
console.log(`Server running on port ${port}`)

export default {
    port,
    fetch: app.fetch,
}
