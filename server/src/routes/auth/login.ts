import express, { Request, Response } from "express";
import { body } from "express-validator";
import passport from "passport";
import { validateRequest } from "../../middlewares/validate-request";
import { requireLogout } from "../../middlewares/require-logout";

const router = express.Router();

router.post(
  "/api/auth/login",
  requireLogout,
  [
    body("email").trim().isEmail().withMessage("Must provide a valid email"),
    body("password")
      .trim()
      .notEmpty()
      .withMessage("You must supply a password"),
  ],
  validateRequest,
  passport.authenticate("local"),
  async (req: Request, res: Response) => {
    res.status(200).send({ user: req.user });
  }
);

export { router as loginRouter };
