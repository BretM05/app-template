import express, { NextFunction, Request, Response } from "express";
import { body } from "express-validator";
import { validateRequest } from "../../middlewares/validate-request";
import { BadRequestError } from "../../errors/bad-request-error";
import { requireLogout } from "../../middlewares/require-logout";

import { User } from "../../models/User";
import { createRandomToken } from "../../utils/randomToken";
import { sendMail } from "../../config/nodemailer";

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

    const email_verify_token = createRandomToken();
    const user = User.build({ email, password });
    user.email_verify_token = email_verify_token;
    await user.save();

    await sendMail({
      from: "noreply@yourappname.com", // sender address
      to: `${user.email}`, // list of receivers
      subject: "App Name - Verify Your Email", // Subject line
      text: `Thank you for signing up for app name! Please verify your email by clicking the link below, or copy/paste it into your browser. verify email link here -- REMOVE FOR PRODUCTION: http://localhost/api/auth/verifyemail/${user.email_verify_token}`, // plain text body
      html: `<h1>Thank you for signing up for app name!</h1><p>Please verify your email by clicking the link below, or copy/paste it into your browser.</p><p><b>verify email link here</b></p><p><b>REMOVE FOR PRODUCTION: http://localhost/api/auth/verifyemail/${user.email_verify_token}</b></p>`, // html body
    });

    req.login(user, (err) => {
      if (err) {
        throw new Error("Error logging in");
      }
    });

    res.status(201).send({ user });
  }
);

export { router as signupRouter };
