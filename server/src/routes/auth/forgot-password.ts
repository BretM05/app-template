import express, { Request, Response } from "express";
import { body } from "express-validator";
import { NotFoundError } from "../../errors/not-found-error";
import { User } from "../../models/User";
import { createRandomToken } from "../../utils/randomToken";
import { sendMail } from "../../config/nodemailer";
import { validateRequest } from "../../middlewares/validate-request";

const router = express.Router();

router.post(
  "/api/auth/forgotPassword",
  [
    body("email")
      .trim()
      .toLowerCase()
      .isEmail()
      .withMessage("Must provide a valid email"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      throw new NotFoundError();
    }

    const token = createRandomToken();
    user.password_reset_token = token;
    user.password_reset_expires = Date.now() + 3600000; // 1 hour
    await user.save();

    await sendMail({
      from: "noreply@yourappname.com", // sender address
      to: `${user.email}`, // list of receivers
      subject: "App Name - Reset Password", // Subject line
      text: `You are receiving this email because you (or somebody else) requested a password reset on app name. Please complete the process by clicking the link below, or copy/paste it into your browser. password reset link here -- REMOVE FOR PRODUCTION: http://localhost/api/auth/resetPassword/${user.password_reset_token}`, // plain text body
      html: `<h1>App name password reset</h1><p>You are receiving this email because you (or somebody else) requested a password reset on app name. Please complete the process by clicking the link below, or copy/paste it into your browser.</p><p><b>password reset link here</b></p><p><b>REMOVE FOR PRODUCTION: http://localhost/api/auth/resetPassword/${user.password_reset_token}</b></p>`, // html body
    });
    res.status(200).send({ user });
  }
);

export { router as forgotPasswordRouter };
