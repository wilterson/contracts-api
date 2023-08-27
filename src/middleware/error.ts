import { NextFunction, Request, Response } from 'express'

/* eslint-disable */
function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  /* eslint-enable */
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500
  res.status(statusCode)
  res.json({
    message: err.message,
    stack:
      process.env.NODE_ENV === 'production'
        ? 'Something went wrong'
        : err.stack,
  })
}

export { errorHandler }
