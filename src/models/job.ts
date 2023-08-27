import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  Default,
  Model,
  Table,
} from 'sequelize-typescript'

import { Contract } from './contract'

@Table({
  tableName: 'jobs',
  timestamps: false,
})
class Job extends Model {
  @AllowNull(false)
  @Column(DataType.TEXT)
  description: string

  @AllowNull(false)
  @Column(DataType.DECIMAL(12, 2))
  price: number

  @Default(false)
  @AllowNull(false)
  @Column(DataType.BOOLEAN)
  paid: boolean

  @Column(DataType.DATE)
  paymentDate: Date

  @BelongsTo(() => Contract, 'ContractId')
  Contract: Contract
}

export { Job }
