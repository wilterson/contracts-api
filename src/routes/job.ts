import { jobController } from '@/controllers/job'
import { getProfile } from '@/middleware/getProfile'
import { Router } from 'express'

const jobRouter = Router()

jobRouter.get('/jobs/unpaid', getProfile, jobController.getUnpaid)

jobRouter.post('/jobs/:jobId/pay', getProfile, jobController.pay)

export { jobRouter }
