import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import { config } from './config.js';
import { apiRouter } from './routes';

export function createServer() {
  const app = express();

  // Security headers
  app.use(helmet());

  // CORS
  const corsMiddleware = cors({
    origin: (origin, callback) => {
      // Allow requests without Origin
      if (!origin) {
        return callback(null, true);
      }

      // Allow configured origins
      if (config.corsOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.warn(`Blocked by CORS: ${origin}`);
      return callback(new Error('Not allowed by CORS'));
    },

    credentials: true,

    methods: [
      'GET',
      'POST',
      'PUT',
      'PATCH',
      'DELETE',
      'OPTIONS',
    ],

    allowedHeaders: [
      'Content-Type',
      'Authorization',
    ],
  });

  // Apply CORS
  app.use(corsMiddleware);

  // Handle preflight requests
  app.options('*', corsMiddleware);

  // Body parser
  app.use(
    express.json({
      limit: '10mb',
    })
  );

  // Health check
  app.get('/healthz', (_req, res) => {
    res.json({
      ok: true,
      timestamp: new Date().toISOString(),
    });
  });

  // API routes
  app.use('/api', apiRouter);

  // Global error handler
  app.use((
    err: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error(err);

    res.status(500).json({
      error: 'internal_error',
    });
  });

  return app;
}