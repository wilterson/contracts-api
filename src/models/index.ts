import { Sequelize } from 'sequelize-typescript'

import { Contract } from './contract'
import { Job } from './job'
import { Profile } from './profile'

export const sequelize = new Sequelize({
  database: 'deel',
  dialect: 'sqlite',
  storage: 'database.sqlite3',
  models: [Contract, Profile, Job],
})
