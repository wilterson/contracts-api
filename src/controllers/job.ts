import { IAuthRequest } from '@/interfaces/auth-request'
import { sequelize } from '@/models'
import { Contract } from '@/models/contract'
import { Job } from '@/models/job'
import { Profile } from '@/models/profile'
import { Response } from 'express'
import { Op, Transaction } from 'sequelize'

export const jobController = {
  /**
   * @returns user's unpaid jobs
   */
  async getUnpaid(req: IAuthRequest, res: Response) {
    const { id } = req.profile

    const jobs = await Job.findAll({
      where: {
        paid: false,
      },
      include: [
        {
          model: Contract,
          where: {
            [Op.or]: [{ ClientId: id }, { ContractorId: id }],
            status: 'in_progress',
          },
        },
      ],
    })

    return res.json(jobs).end()
  },

  /**
   * @description Pay for a job. Only clients can pay for jobs.
   */
  async pay(req: IAuthRequest, res: Response) {
    const { jobId } = req.params
    const client = req.profile

    if (req.profile.get('type') !== 'client') {
      return res
        .status(403)
        .json({ message: 'Only clients can pay for jobs' })
        .end()
    }

    const job = await Job.findOne({
      where: {
        id: jobId,
        paid: false,
      },
      include: [
        {
          model: Contract,
          where: {
            ClientId: client.id,
            status: 'in_progress',
          },
          include: [
            {
              model: Profile,
              as: 'Contractor',
            },
            {
              model: Profile,
              as: 'Client',
            },
          ],
        },
      ],
    })

    if (!job) {
      return res
        .status(404)
        .json({
          message: 'This job does not exist or is not available for payment',
        })
        .end()
    }

    const amount = job.get('price')

    if (client.get('balance') < amount) {
      return res
        .status(403)
        .json({ message: 'Insufficient funds to pay for this job' })
        .end()
    }

    try {
      const client = job.get('Contract').get('Client')
      const contractor = job.get('Contract').get('Contractor')

      const paymentTransaction = await sequelize.transaction(
        {
          isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE,
        },
        async t => {
          await client.decrement('balance', {
            by: amount,
            transaction: t,
          })

          const transfer = await contractor.increment('balance', {
            by: amount,
            transaction: t,
          })

          const jobUpdated = await Job.update(
            {
              paid: true,
              paymentDate: new Date(),
            },
            {
              where: {
                id: job.get('id'),
              },
              transaction: t,
            }
          )

          const contractUpdated = await Contract.update(
            {
              status: 'terminated',
            },
            {
              where: {
                id: job.get('Contract').get('id'),
              },
              transaction: t,
            }
          )

          if (!transfer || !jobUpdated || !contractUpdated) {
            throw new Error('Payment failed')
          }

          return jobUpdated
        }
      )

      if (!paymentTransaction) {
        throw new Error('Payment failed')
      }

      return res.json({ message: 'Payment successful' }).end()
    } catch (err: any) {
      return res
        .status(500)
        .json({ message: err.message || 'Internal server error' })
        .end()
    }
  },
}
