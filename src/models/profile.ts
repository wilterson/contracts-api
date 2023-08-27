import {
  AllowNull,
  Column,
  DataType,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript'

import { Contract } from './contract'

enum ProfileType {
  CLIENT = 'client',
  CONTRACTOR = 'contractor',
}

@Table({
  tableName: 'profiles',
  timestamps: false,
})
class Profile extends Model {
  @AllowNull(false)
  @Column
  firstName: string

  @AllowNull(false)
  @Column
  lastName: string

  @AllowNull(false)
  @Column
  profession: string

  @Column(DataType.DECIMAL(10, 2))
  balance: number

  @Column(DataType.ENUM(...Object.values(ProfileType)))
  type: ProfileType

  @HasMany(() => Contract, 'ContractorId')
  Contractor: Contract[]

  @HasMany(() => Contract, 'ClientId')
  Client: Contract[]

  get fullName() {
    return `${this.get('firstName')} ${this.get('lastName')}`
  }
}

export { Profile }
