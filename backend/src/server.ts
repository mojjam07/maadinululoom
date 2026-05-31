import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { config } from './config.js'
import { apiRouter } from './routes'

export function createServer() {
  const app = express()

  app.use(helmet())
  app.use(cors({ origin: config.corsOrigin, credentials: true }))
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
