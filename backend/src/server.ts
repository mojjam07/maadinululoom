import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { config } from './config.js'
import { apiRouter } from './routes'

export function createServer() {
  const app = express()

  app.use(helmet())

  const corsMiddleware = cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true)

      // Allow configured SPA origins (from env)
      return callback(null, config.corsOrigin === '*' || origin === config.corsOrigin)
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })

  // Apply CORS middleware to both normal requests and preflight OPTIONS.
  app.use(corsMiddleware)
  app.options('*', corsMiddleware)

  app.use(express.json({ limit: '10mb' }))

  app.get('/healthz', (_req, res) => res.json({ ok: true }))

  app.use('/api', apiRouter)

  app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    // eslint-disable-next-line no-console
    console.error(err)
    res.status(500).json({ error: 'internal_error' })
  })

  return app
}

