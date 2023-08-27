import bodyParser from 'body-parser'
import express from 'express'

import { errorHandler } from './middleware/error'
import { notFound } from './middleware/notFound'
import { sequelize } from './models'
import { adminRouter } from './routes/admin'
import { balanceRouter } from './routes/balance'
import { contractRouter } from './routes/contract'
import { jobRouter } from './routes/job'

const app = express()

app.use(bodyParser.json())
app.set('sequelize', sequelize)
app.set('models', sequelize.models)

// Routers
app.use(adminRouter)
app.use(balanceRouter)
app.use(contractRouter)
app.use(jobRouter)

app.use(notFound)
app.use(errorHandler)

export { app }
