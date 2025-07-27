import { Request, Response, NextFunction } from 'express';
import { AnyZodObject } from 'zod';
import { createError } from './errorHandler';

export const validateRequest = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error) {
      return next(createError('Données de requête invalides', 400));
    }
  };
}; 