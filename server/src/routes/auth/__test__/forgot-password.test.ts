import request from "supertest";
import { User } from "../../../models/User";
import { app } from "../../../test/setup";
import { sendMail } from "../../../config/nodemailer";
import { resendVerifyEmailRouter } from "../resend-verify-email";

it("responds 400 if provided invalid email", async () => {
  const response = await request(app)
    .post("/api/auth/forgotPassword")
    .send({
      email: "notavalidemail",
    })
    .expect(400);

  expect(response.body.errors[0].message).toEqual("Must provide a valid email");
});

it("responds 404 if no user found for email", async () => {
  await request(app)
    .post("/api/auth/forgotPassword")
    .send({
      email: "test@test.com",
    })
    .expect(404);
});

it("sets new random token/expiration and calls sendMail", async () => {
  await global.createUser("test@test.com", "password");
  const user = await User.findOne({ email: "test@test.com" });

  const response = await request(app)
    .post("/api/auth/forgotPassword")
    .send({
      email: "test@test.com",
    })
    .expect(200);

  expect(response.body.user.email).toEqual("test@test.com");

  const updatedUser = await User.findById(user?.id);
  expect(updatedUser?.password_reset_token).toBeDefined();
  expect(updatedUser?.password_reset_expires).toBeDefined();
  expect(updatedUser?.password_reset_token).not.toEqual(
    user?.password_reset_token
  );
  expect(updatedUser?.password_reset_expires).not.toEqual(
    user?.password_reset_expires
  );

  // called once for global.createUser, and once for forgotPassword
  expect(sendMail).toHaveBeenCalledTimes(2);
});
