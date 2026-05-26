import { Router } from 'express'
import { authRouter } from './auth'
import { profileRouter } from './profile'
import { subjectsRouter } from './subjects'
import { enrollmentsRouter } from './enrollments'

export const apiRouter = Router()

apiRouter.use('/auth', authRouter)
apiRouter.use('/profile', profileRouter)
apiRouter.use('/subjects', subjectsRouter)
apiRouter.use('/enrollments', enrollmentsRouter)
