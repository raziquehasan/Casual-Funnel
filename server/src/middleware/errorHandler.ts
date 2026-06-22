import { Request, Response, NextFunction } from 'express';

interface AppError extends Error {
  statusCode?: number;
  code?: number;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: AppError, req: Request, res: Response, next: NextFunction): void {
  const statusCode = err.statusCode ?? 500;
  const isDev = process.env.NODE_ENV === 'development';

  console.error(`[Error] ${req.method} ${req.path}:`, err.message);
  if (isDev) console.error(err.stack);

  res.status(statusCode).json({
    success: false,
    error: err.message ?? 'Internal Server Error',
    ...(isDev && { stack: err.stack }),
  });
}
