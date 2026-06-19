import type express from 'express'

export function requireRole(role: 'admin' | 'teacher' | 'student') {
  return function (req: express.Request, res: express.Response, next: express.NextFunction) {
    const auth = (req as any).auth as { userId?: string; role?: string } | undefined
    if (!auth || !auth.userId) return res.status(401).json({ error: 'missing_user' })
    const userRole = auth.role || null
    if (!userRole) return res.status(403).json({ error: 'role_missing' })
    if (role === 'admin' && userRole !== 'admin') return res.status(403).json({ error: 'forbidden' })
    if (role === 'teacher' && userRole !== 'teacher' && userRole !== 'admin') return res.status(403).json({ error: 'forbidden' })
    if (role === 'student' && userRole !== 'student' && userRole !== 'admin') return res.status(403).json({ error: 'forbidden' })
    return next()
  }
}
