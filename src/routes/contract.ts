import { contractController } from '@/controllers/contract'
import { getProfile } from '@/middleware/getProfile'
import { Router } from 'express'

const contractRouter = Router()

contractRouter.get(
  '/contracts/:id',
  getProfile,
  contractController.getContractById
)

contractRouter.get('/contracts', getProfile, contractController.userContracts)

export { contractRouter }
