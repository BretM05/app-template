import passport from "passport";
import passportLocal from "passport-local";
const LocalStrategy = passportLocal.Strategy;

import { Password } from "../utils/password";
import { User } from "../models/User";

passport.serializeUser<any, any>((req, user, done) => {
  // @ts-ignore
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  if (!user) {
    return done(new Error("User not found"));
  }
  done(null, user);
});

/**
 * Sign in using Email and Password.
 */
passport.use(
  new LocalStrategy(
    { usernameField: "email" },
    async (email, password, done) => {
      const existingUser = await User.findOne({ email: email.toLowerCase() });

      if (!existingUser) {
        return done(null, false, { message: "Invalid credentials" });
      }

      const passwordsMatch = await Password.compare(
        existingUser.password,
        password
      );

      if (!passwordsMatch) {
        return done(null, false, { message: "Invalid credentials" });
      }

      return done(null, existingUser);
    }
  )
);
