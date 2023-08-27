import { IAuthRequest } from '@/interfaces/auth-request'
import { Contract } from '@/models/contract'
import { Profile } from '@/models/profile'
import { Response } from 'express'
import { Op } from 'sequelize'

const userCanAccessContract = (contract: Contract, profile: Profile) => {
  return [contract.get('Client').id, contract.get('Contractor').id].includes(
    profile.id
  )
}

export const contractController = {
  /**
   * @returns user's contract by id
   */
  async getContractById(req: IAuthRequest, res: Response) {
    const { id } = req.params

    const contract = await Contract.findOne({
      where: { id },
      include: ['Client', 'Contractor'],
    })

    if (!contract || !userCanAccessContract(contract, req.profile)) {
      return res
        .status(404)
        .json({
          message: `Contract with id ${id} not found`,
        })
        .end()
    }

    return res.json(contract).end()
  },

  /**
   * @returns user's active contracts
   */
  async userContracts(req: IAuthRequest, res: Response) {
    const { id } = req.profile

    const contracts = await Contract.findAll({
      where: {
        [Op.or]: [{ ClientId: id }, { ContractorId: id }],
        status: {
          [Op.not]: 'terminated',
        },
      },
    })

    if (!contracts) {
      return res.status(404).json([]).end()
    }

    return res.json(contracts).end()
  },
}
