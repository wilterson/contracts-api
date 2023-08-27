import { balanceController } from '@/controllers/balance'
import { getProfile } from '@/middleware/getProfile'
import { Router } from 'express'

const balanceRouter = Router()

balanceRouter.post(
  '/balances/deposit/:userId',
  getProfile,
  balanceController.deposit
)

balanceRouter.post('/balances/withdraw', getProfile, balanceController.withdraw)
balanceRouter.get('/balances', getProfile, balanceController.getBalance)

export { balanceRouter }
