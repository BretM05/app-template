import express from "express";
import { requireAuth } from "../../middlewares/require-auth";

const router = express.Router();

router.get("/api/auth/currentuser", requireAuth, (req, res) => {
  res.send({ user: req.user });
});

export { router as currentUserRouter };
