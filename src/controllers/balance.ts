import { IAuthRequest } from '@/interfaces/auth-request'
import { sequelize } from '@/models'
import { Contract } from '@/models/contract'
import { Job } from '@/models/job'
import { Profile } from '@/models/profile'
import { Response } from 'express'
import { Transaction } from 'sequelize'

const getPendingPayments = async (id: number) => {
  const pendingJobs = await Job.findAll({
    where: { paid: false },
    include: [
      {
        model: Contract,
        where: {
          ContractorId: id,
          status: ['in_progress', 'new'],
        },
      },
    ],
  })

  return pendingJobs.reduce((total, job) => total + job.get('price'), 0)
}

const getTotalToPay = async (id: number) => {
  const toPayJobs = await Job.findAll({
    where: { paid: false },
    include: [
      {
        model: Contract,
        where: {
          ClientId: id,
          status: ['in_progress', 'new'],
        },
      },
    ],
  })

  return toPayJobs.reduce((total, job) => total + job.get('price'), 0)
}

export const balanceController = {
  /**
   * @description Clients can only deposit 25% of unpaid jobs total.
   *              Make a deposit to client's balance
   */
  async deposit(req: IAuthRequest, res: Response) {
    const { amount } = req.body
    const { userId } = req.params

    if (req.profile.get('type') !== 'client') {
      return res
        .status(403)
        .json({ message: 'Only clients can make deposits' })
        .end()
    }

    if (!amount) {
      return res.status(400).json({ message: 'Amount is required' }).end()
    }

    const profile = await Profile.findOne({ where: { id: userId } })

    if (!profile) {
      return res.status(404).json({ message: 'User not found' }).end()
    }

    try {
      await sequelize.transaction(
        {
          isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED,
        },
        async t => {
          const unpaidJobs = await Job.findAll({
            where: { paid: false },
            include: [
              {
                model: Contract,
                where: {
                  ClientId: userId,
                  status: ['in_progress', 'new'],
                },
              },
            ],
            transaction: t,
          })

          const unpaidTotal = unpaidJobs.reduce(
            (total, job) => total + job.get('price'),
            0
          )

          const allowedAmount = unpaidTotal * 0.25

          if (amount > allowedAmount) {
            throw new Error(
              `Deposit amount exceeds 25% of unpaid jobs total. Limit: $${allowedAmount}`
            )
          }

          await profile.increment('balance', {
            by: amount,
            transaction: t,
          })

          return profile
        }
      )

      return res.json(profile).end()
    } catch (err: any) {
      return res
        .status(500)
        .json({ message: err.message || 'Internal server error' })
        .end()
    }
  },

  /**
   * @returns user's current balance
   */
  async getBalance(req: IAuthRequest, res: Response) {
    const available = req.profile.get('balance')
    const { id } = req.profile

    try {
      const pending = await getPendingPayments(id)
      const toPay = await getTotalToPay(id)

      return res.json({ available, pending, toPay }).end()
    } catch (err: any) {
      return res
        .status(500)
        .json({ message: err.message || 'Internal server error' })
        .end()
    }
  },

  /**
   * @description Withdraw from contractor's balance
   */
  async withdraw(req: IAuthRequest, res: Response) {
    const { amount } = req.body

    if (req.profile.get('type') !== 'contractor') {
      return res
        .status(403)
        .json({ message: 'Only contractors can make withdrawals' })
        .end()
    }

    if (!amount) {
      return res.status(400).json({ message: 'Amount is required' }).end()
    }

    try {
      await sequelize.transaction(
        {
          isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED,
        },
        async t => {
          const available = req.profile.get('balance')

          if (amount > available) {
            throw new Error(
              `Withdraw amount exceeds available balance. Available: $${available}`
            )
          }

          await req.profile.decrement('balance', {
            by: amount,
            transaction: t,
          })

          return req.profile
        }
      )

      return res
        .json({
          message: 'Withdrawal successful',
        })
        .end()
    } catch (err: any) {
      return res
        .status(500)
        .json({ message: err.message || 'Internal server error' })
        .end()
    }
  },
}
