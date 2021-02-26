import express, { NextFunction, Request, Response } from "express";
import { body } from "express-validator";
import { validateRequest } from "../../middlewares/validate-request";
import { BadRequestError } from "../../errors/bad-request-error";
import { requireLogout } from "../../middlewares/require-logout";

import { User } from "../../models/User";

const router = express.Router();

router.post(
  "/api/auth/signup",
  requireLogout,
  [
    body("email").trim().isEmail().withMessage("Must provide a valid email"),
    body("password")
      .trim()
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const email = req.body.email.toLowerCase();
    const { password } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new BadRequestError("Email already in use");
    }

    const user = User.build({ email, password });
    await user.save();

    req.login(user, (err) => {
      if (err) {
        throw new Error("Error logging in");
      }
    });

    res.status(201).send({ user });
  }
);

export { router as signupRouter };
