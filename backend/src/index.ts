import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'
import { cors } from 'hono/cors'
import env from './env'

// Import routes
import registrationRoutes from './routes/registration'
import derivativeRoutes from './routes/derivative'
import disputeRoutes from './routes/dispute'
import licenseRoutes from './routes/licenses'
import royaltyRoutes from './routes/royalty'
import miscRoutes from './routes/misc'
import verificationRoutes from './routes/verification'
import tracksRoutes from './routes/tracks'
import usersRoutes from './routes/users'
import uploadRoutes from './routes/upload'

const app = new Hono()

// Middleware
app.use('*', cors({ origin: '*' }))
app.use('*', logger())
app.use('*', prettyJSON())

// Routes
app.route('/api/registration', registrationRoutes)
app.route('/api/derivative', derivativeRoutes)
app.route('/api/dispute', disputeRoutes)
app.route('/api/licenses', licenseRoutes)
app.route('/api/royalty', royaltyRoutes)
app.route('/api/misc', miscRoutes)
app.route('/api/verification', verificationRoutes)
app.route('/api/tracks', tracksRoutes)
app.route('/api/users', usersRoutes)
app.route('/api/upload', uploadRoutes)

// API info route
app.get('/', (c) => {
    return c.json({
        message: 'Proof9 API Server',
        version: '1.0.0',
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

// Startup logging
console.log(`🎵 Proof9 API Server starting on port ${env.PORT}`)

export default {
    port: env.PORT,
    fetch: app.fetch,
}
