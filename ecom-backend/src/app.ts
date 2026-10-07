import express, { Application, Request, Response } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import routes from './common/routes'
import unknownEndpoint from './middlewares/unknownEndpoint'
import stripeWebhooksController from './resources/stripe/webhooks/controller';
import './common/env'

const app: Application = express()

// middleware
app.disable('x-powered-by')
app.use(cors({ origin: 'http://localhost:3000' }))
app.use(helmet())
app.use(compression())

// 1. Stripe Webhook Endpoint ( for Stripe to send events to our backend )
app.post('/webhook', express.raw({ type: 'application/json' }), stripeWebhooksController.receiveUpdates)

// 2. JSON Parsing
app.use(
  express.urlencoded({
    extended: true,
    limit: process.env.REQUEST_LIMIT || '100kb',
  }),
)
app.use(express.json())

// Health check
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    'health-check': 'OK: top level api working',
  })
})

// API Routes (/v1/checkout vb.)
app.use('/v1/', routes)

// Handle unknown endpoints
app.use('*', unknownEndpoint)

export default app
