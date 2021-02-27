import express, { Request, Response } from "express";
import { BadRequestError } from "../../errors/bad-request-error";
import { NotFoundError } from "../../errors/not-found-error";
import { requireAuth } from "../../middlewares/require-auth";
import { User } from "../../models/User";
import { createRandomToken } from "../../utils/randomToken";
import { sendMail } from "../../config/nodemailer";

const router = express.Router();

router.get(
  "/api/auth/resendVerifyEmail",
  requireAuth,
  async (req: Request, res: Response) => {
    // TODO: Figure out why req.user.id still gives typescript error
    // even after extending the interface in types/express-types.d.ts
    // @ts-ignore
    const user = await User.findById(req.user?.id);
    if (!user) {
      throw new NotFoundError();
    }

    if (user.email_is_verified) {
      user.email_verify_token = undefined;
      await user.save();
      throw new BadRequestError("Email already verified");
    }

    const newToken = createRandomToken();
    user.email_verify_token = newToken;
    await user.save();

    await sendMail({
      from: "noreply@yourappname.com", // sender address
      to: `${user.email}`, // list of receivers
      subject: "App Name - Verify Your Email", // Subject line
      text: `Thank you for signing up for app name! Please verify your email by clicking the link below, or copy/paste it into your browser. verify email link here -- REMOVE FOR PRODUCTION: http://localhost/api/auth/verifyemail/${user.email_verify_token}`, // plain text body
      html: `<h1>Thank you for signing up for app name!</h1><p>Please verify your email by clicking the link below, or copy/paste it into your browser.</p><p><b>verify email link here</b></p><p><b>REMOVE FOR PRODUCTION: http://localhost/api/auth/verifyemail/${user.email_verify_token}</b></p>`, // html body
    });
    res.status(200).send();
  }
);

export { router as resendVerifyEmailRouter };
