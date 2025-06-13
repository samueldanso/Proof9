import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'
import { cors } from 'hono/cors'
import env from './env'

import registrationRoutes from './routes/registration'
import licenseRoutes from './routes/licenses'
import royaltyRoutes from './routes/royalty'
import verificationRoutes from './routes/verification'
import tracksRoutes from './routes/tracks'
import usersRoutes from './routes/users'
import uploadRoutes from './routes/upload'

const app = new Hono()

app.use('*', cors({ origin: '*' }))
app.use('*', logger())
app.use('*', prettyJSON())

// Routes - Core Story Protocol Integration
app.route('/api/registration', registrationRoutes)
app.route('/api/licenses', licenseRoutes)
app.route('/api/royalty', royaltyRoutes)
app.route('/api/verification', verificationRoutes)

// Routes - Frontend Support
app.route('/api/tracks', tracksRoutes)
app.route('/api/users', usersRoutes)
app.route('/api/upload', uploadRoutes)

// API info route
app.get('/', (c) => {
    return c.json({
        message: 'Proof9 API Server',
        version: '1.0.0',
        description: 'Core backend for music IP protection, verification, and licensing',
        endpoints: {
            core_features: ['/api/registration', '/api/licenses', '/api/royalty', '/api/verification'],
            frontend_support: ['/api/tracks', '/api/users', '/api/upload'],
        },
        integrations: {
            'Story Protocol': 'IP registration and licensing',
            Yakoa: 'Music verification and originality checking',
            IPFS: 'Decentralized metadata storage',
        },
    })
})

// Startup logging
console.log(`🎵 Proof9 API Server starting on port ${env.PORT}`)

export default {
    port: env.PORT,
    fetch: app.fetch,
}
