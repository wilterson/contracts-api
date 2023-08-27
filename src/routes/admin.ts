import { adminController } from '@/controllers/admin'
import { getProfile } from '@/middleware/getProfile'
import { Router } from 'express'

const adminRouter = Router()

adminRouter.get('/admin/best-clients', getProfile, adminController.bestClients)

adminRouter.get(
  '/admin/best-profession',
  getProfile,
  adminController.bestProfessions
)

export { adminRouter }
