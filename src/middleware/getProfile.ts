import { IAuthRequest } from '@/interfaces/auth-request'
import { Profile } from '@/models/profile'
import { NextFunction, Response } from 'express'

const getProfile = async (
  req: IAuthRequest,
  res: Response,
  next: NextFunction
) => {
  const profile = await Profile.findOne({
    where: { id: req.get('profile_id') || 0 },
  })

  if (!profile) {
    return res
      .status(401)
      .json({
        message: 'Unauthorized',
      })
      .end()
  }

  req.profile = profile

  return next()
}

export { getProfile }
