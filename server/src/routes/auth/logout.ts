import express, { Request, Response } from "express";
import { requireAuth } from "../../middlewares/require-auth";
const router = express.Router();

router.get(
  "/api/auth/logout",
  requireAuth,
  async (req: Request, res: Response) => {
    req.logout();
    res.status(200).send();
  }
);

export { router as logoutRouter };
