import type { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";

export function validateBody(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    req.body = schema.parse(req.body);
    next();
  };
}

export function validateQuery(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.parse(req.query);
    // Express 5 query object is read-only, so mutate its properties instead
    for (const key of Object.keys(req.query)) {
      delete req.query[key];
    }
    Object.assign(req.query, parsed);
    next();
  };
}
