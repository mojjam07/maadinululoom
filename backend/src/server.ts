import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser'
import csurf from 'csurf'
import rateLimit from 'express-rate-limit';

import { config } from './config.js';
import { apiRouter } from './routes';

export function createServer() {
  const app = express();

  // Rate limiting: general API limiter
  const apiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100, // limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
  })

  // Stricter limiter for auth endpoints
  const authLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
  })

  // Apply general limiter to API surface
  app.use('/api', apiLimiter)
  // Security headers
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'", '*'],
        },
      },
      crossOriginEmbedderPolicy: false,
    })
  );

  // CORS
  const corsMiddleware = cors({
    origin: (origin, callback) => {
      // Allow requests without Origin
      if (!origin) {
        return callback(null, true);
      }

      // Allow any localhost origin (different dev ports) to avoid CORS during local development
      try {
        const lower = origin.toLowerCase()
        if (lower.startsWith('http://localhost') || lower.startsWith('https://localhost')) {
          return callback(null, true)
        }
      } catch (e) {
        // ignore and continue to configured origins check
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

  // Apply auth-specific rate limiting
  app.use('/api/auth', authLimiter)

  // Handle preflight requests
  app.options('*', corsMiddleware);

  // Body parser
  app.use(
    express.json({
      limit: '10mb',
    })
  );

  // Cookie parser required for CSRF tokens stored in cookies
  app.use(cookieParser())

  // CSRF protection for API routes except webhooks (webhooks use raw body)
  const csrfProtection = csurf({ cookie: true })
  app.use('/api', (req, res, next) => {
    if (req.path.startsWith('/webhooks')) return next()
    return csrfProtection(req, res, next)
  })

  // CSRF token endpoint for clients
  app.get('/api/csrf-token', (req, res) => {
    // @ts-ignore
    return res.json({ csrfToken: req.csrfToken ? req.csrfToken() : null })
  })

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