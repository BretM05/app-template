import express, { Request, Response } from "express";
import { BadRequestError } from "../../errors/bad-request-error";
import { NotFoundError } from "../../errors/not-found-error";
import { User } from "../../models/User";

const router = express.Router();

router.get(
  "/api/auth/verifyemail/:token",
  async (req: Request, res: Response) => {
    const { token } = req.params;
    const user = await User.findOne({ email_verify_token: token });
    if (!user) {
      throw new NotFoundError();
    }
    if (user.email_is_verified) {
      user.email_verify_token = undefined;
      await user.save();
      throw new BadRequestError("Email already verified!");
    }

    user.email_is_verified = true;
    user.email_verify_token = undefined;

    const updatedUser = await user.save();

    req.login(updatedUser, (err) => {
      if (err) {
        throw new Error("Error logging in");
      }
    });

    res.status(200).send({ user: updatedUser });
  }
);

export { router as verifyEmailRouter };
