import { Request } from 'express'

interface IAuthRequest extends Request {
  profile?: any
}

export { IAuthRequest }
