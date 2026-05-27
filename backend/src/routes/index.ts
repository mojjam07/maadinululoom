import { Router } from 'express'
import { authRouter } from './auth'
import { profileRouter } from './profile'
import { subjectsRouter } from './subjects'
import { enrollmentsRouter } from './enrollments'
import { lessonsRouter } from './lessons'
import { progressRouter } from './progress'
import { assignmentsRouter } from './assignments'
import { submissionsRouter } from './submissions'
import { attendanceRouter } from './attendance'
import { teacherRouter } from './teacher'

export const apiRouter = Router()


apiRouter.use('/auth', authRouter)
apiRouter.use('/profile', profileRouter)
apiRouter.use('/subjects', subjectsRouter)
apiRouter.use('/enrollments', enrollmentsRouter)
apiRouter.use('/lessons', lessonsRouter)
apiRouter.use('/progress', progressRouter)
apiRouter.use('/assignments', assignmentsRouter)
apiRouter.use('/submissions', submissionsRouter)
apiRouter.use('/attendance', attendanceRouter)
apiRouter.use('/teacher', teacherRouter)


