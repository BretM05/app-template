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

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    resave: true,
    saveUninitialized: true,
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

app.all("*", async (req, res) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
