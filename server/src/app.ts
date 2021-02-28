import express from "express";
import "express-async-errors";
import bodyParser from "body-parser";
import session from "express-session";
import passport from "passport";
import MongoStore from "connect-mongo";

import { errorHandler } from "./middlewares/error-handler";
import { NotFoundError } from "./errors/not-found-error";

import "./config/passport";
import { currentUserRouter } from "./routes/auth/current-user";
import { loginRouter } from "./routes/auth/login";
import { logoutRouter } from "./routes/auth/logout";
import { signupRouter } from "./routes/auth/signup";
import { verifyEmailRouter } from "./routes/auth/verify-email";
import { resendVerifyEmailRouter } from "./routes/auth/resend-verify-email";
import { forgotPasswordRouter } from "./routes/auth/forgot-password";
import { resetPasswordRouter } from "./routes/auth/reset-password";

const initializeApp = () => {
  const app = express();
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(
    session({
      resave: false,
      saveUninitialized: false,
      secret: process.env.SESSION_SECRET!,
      store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI,
      }),
    })
  );
  app.use(passport.initialize());
  app.use(passport.session());

  app.use(currentUserRouter);
  app.use(loginRouter);
  app.use(logoutRouter);
  app.use(signupRouter);
  app.use(verifyEmailRouter);
  app.use(resendVerifyEmailRouter);
  app.use(forgotPasswordRouter);
  app.use(resetPasswordRouter);

  app.all("*", async (req, res) => {
    throw new NotFoundError();
  });

  app.use(errorHandler);

  return app;
};

export { initializeApp };
