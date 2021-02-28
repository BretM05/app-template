import express, { Request, Response } from "express";
import { body } from "express-validator";
import { NotFoundError } from "../../errors/not-found-error";
import { User } from "../../models/User";
import { validateRequest } from "../../middlewares/validate-request";
import { BadRequestError } from "../../errors/bad-request-error";

const router = express.Router();

router.post(
  "/api/auth/resetPassword",
  [
    body("password").notEmpty().trim().withMessage("Must provide a password"),
    body("token").notEmpty().withMessage("Must provide token"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const user = await User.findOne({ password_reset_token: req.body.token });
    if (!user) {
      throw new NotFoundError();
    }
    if (
      !user.password_reset_expires ||
      user.password_reset_expires < Date.now()
    ) {
      throw new BadRequestError("Password reset token expired");
    }

    user.password_reset_token = undefined;
    user.password_reset_expires = undefined;
    user.password = req.body.password;

    await user.save();

    res.status(200).send({ user });
  }
);

export { router as resetPasswordRouter };
