import type express from 'express'
import { ZodSchema } from 'zod'

export function validateBody(schema: ZodSchema<any>) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const result = schema.parse(req.body)
      req.body = result
      return next()
    } catch (e: any) {
      return res.status(400).json({ error: 'invalid_request', details: e.errors || e.message })
    }
  }
}

export function validateParams(schema: ZodSchema<any>) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const result = schema.parse(req.params)
      req.params = result
      return next()
    } catch (e: any) {
      return res.status(400).json({ error: 'invalid_params', details: e.errors || e.message })
    }
  }
}
