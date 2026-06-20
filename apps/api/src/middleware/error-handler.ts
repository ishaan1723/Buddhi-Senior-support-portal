import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { HttpError } from "../utils/http-error.js";

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) {
    res.status(400).json({
      error: "Validation failed",
      code: "VALIDATION_ERROR",
      details: error.flatten()
    });
    return;
  }

  if (error instanceof HttpError) {
    res.status(error.statusCode).json({ error: error.message, code: error.code });
    return;
  }

  console.error(error);
  res.status(500).json({ error: "Something went wrong. Please try again.", code: "INTERNAL_ERROR" });
};
