import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript'

import { Job } from './job'
import { Profile } from './profile'

enum ContractStatuses {
  NEW = 'new',
  IN_PROGRESS = 'in_progress',
  TERMINATED = 'terminated',
}

@Table({
  tableName: 'contracts',
  timestamps: false,
})
class Contract extends Model {
  @AllowNull(false)
  @Column(DataType.TEXT)
  terms: string

  @Column(DataType.ENUM(...Object.values(ContractStatuses)))
  status: ContractStatuses

  @BelongsTo(() => Profile, 'ContractorId')
  Contractor: Profile

  @BelongsTo(() => Profile, 'ClientId')
  Client: Profile

  @HasMany(() => Job, 'ContractId')
  Jobs: Job[]
}

export { Contract }
