import { IAuthRequest } from '@/interfaces/auth-request'
import { sequelize } from '@/models'
import { Contract } from '@/models/contract'
import { Job } from '@/models/job'
import { Profile } from '@/models/profile'
import { Response } from 'express'
import { Op, Transaction } from 'sequelize'

export const adminController = {
  /**
   * @description Get the best clients for a given time period.
   * @returns a list of the best clients
   */
  async bestClients(req: IAuthRequest, res: Response) {
    const { start, end, limit = 2 } = req.query

    if (!start || !end) {
      return res
        .status(400)
        .json({ message: 'Start and end dates are required' })
        .end()
    }

    const parsedLimit = Math.max(0, Number(limit))

    try {
      const clients = await sequelize.transaction(
        {
          isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED,
        },
        async t => {
          const jobs = await Job.findAll({
            where: {
              paid: true,
              paymentDate: {
                [Op.between]: [start, end],
              },
            },
            attributes: [
              'Contract.Client.id',
              'Contract.Client.firstName',
              'Contract.Client.lastName',
              'Contract.Client.profession',
              [sequelize.fn('sum', sequelize.col('price')), 'paid'],
            ],
            include: [
              {
                model: Contract,
                where: {
                  status: 'terminated',
                },
                include: [
                  {
                    model: Profile,
                    as: 'Client',
                    where: {
                      type: 'client',
                    },
                  },
                ],
              },
            ],
            group: ['Contract.Client.id'],
            order: [[sequelize.literal('paid'), 'DESC']],
            limit: parsedLimit,
            transaction: t,
          })

          const bestClients = jobs.reduce(
            (acc, job) => {
              const client = job.get('Contract').get('Client')
              const id = client.get('id')
              const paid = job.get('paid')

              if (!acc[id]) {
                acc[id] = {
                  id,
                  fullName: client.fullName,
                  paid: 0,
                }
              }

              acc[id].paid += paid

              return acc
            },
            {} as Record<string, any>
          )

          return Object.values(bestClients).sort((a, b) => b.paid - a.paid)
        }
      )

      return res.json(clients)
    } catch (error) {
      console.error(error)
      return res.status(500).json({ message: 'Internal server error' })
    }
  },

  /**
   * @description Get the best profession for a given time period.
   *
   * @returns a list of the best professions
   */
  async bestProfessions(req: IAuthRequest, res: Response) {
    const { start, end } = req.query

    if (!start || !end) {
      return res
        .status(400)
        .json({ message: 'Start and end dates are required' })
        .end()
    }

    if (!start || !end) {
      return res
        .status(400)
        .json({ message: 'Invalid start or end date' })
        .end()
    }

    try {
      const professions = await sequelize.transaction(
        {
          isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED,
        },
        async t => {
          const jobs = await Job.findAll({
            where: {
              paid: true,
              paymentDate: {
                [Op.between]: [start, end],
              },
            },
            attributes: [
              'Contract.Contractor.profession',
              'Contract.Contractor.id',
              [sequelize.fn('sum', sequelize.col('price')), 'earned'],
            ],
            include: [
              {
                model: Contract,
                where: {
                  status: 'terminated',
                },
                include: [
                  {
                    model: Profile,
                    as: 'Contractor',
                    where: {
                      type: 'contractor',
                    },
                  },
                ],
              },
            ],
            group: ['Contract.Contractor.profession', 'Contract.Contractor.id'],
            order: [[sequelize.literal('earned'), 'DESC']],
            transaction: t,
          })

          const bestProfessions = jobs.reduce(
            (acc, job) => {
              const contractor = job.get('Contract').get('Contractor')
              const id = contractor.get('id')
              const earned = job.get('earned') as number

              if (!acc[id]) {
                acc[id] = {
                  id,
                  fullName: contractor.fullName,
                  earned: 0,
                }
              }

              acc[id].earned += earned

              return acc
            },
            {} as Record<string, any>
          )

          return Object.values(bestProfessions).sort(
            (a, b) => b.earned - a.earned
          )
        }
      )

      return res.json(professions)
    } catch (error) {
      console.error(error)
      return res.status(500).json({ message: 'Internal server error' })
    }
  },
}
