import { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../errors/bad-request-error";

export const requireLogout = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.isAuthenticated()) {
    throw new BadRequestError("Already logged in.");
  }
  return next();
};
