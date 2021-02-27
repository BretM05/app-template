import request from "supertest";
import { User } from "../../../models/User";
import { app } from "../../../test/setup";
import { sendMail } from "../../../config/nodemailer";

it("responds 401 if not logged in", async () => {
  await request(app).get("/api/auth/resendVerifyEmail").send().expect(401);
});

it("responds 400 and removes token if user email is already verified", async () => {
  const userCookie = await global.createUser("test@test.com", "password");
  const user = await User.findOne({ email: "test@test.com" });

  // manually set token and verified flag for test
  user!.email_verify_token = "1234abcd";
  user!.email_is_verified = true;

  await user!.save();

  const response = await request(app)
    .get("/api/auth/resendVerifyEmail")
    .set("Cookie", userCookie)
    .send()
    .expect(400);

  expect(response.body.errors[0].message).toEqual("Email already verified");

  const updatedUser = await User.findById(user!.id);
  expect(updatedUser?.email_verify_token).toBe(undefined);
});

it("sets new random email_verify_token and calls sendMail", async () => {
  const userCookie = await global.createUser("test@test.com", "password");
  const user = await User.findOne({ email: "test@test.com" });
  const old_token = user?.email_verify_token;

  await request(app)
    .get("/api/auth/resendVerifyEmail")
    .set("Cookie", userCookie)
    .send()
    .expect(200);

  const updatedUser = await User.findById(user?.id);
  expect(updatedUser?.email_verify_token).toBeDefined();
  expect(updatedUser?.email_is_verified).toBeFalsy();
  expect(updatedUser?.email_verify_token).not.toEqual(old_token);

  // called once for global.createUser, and once for resendVerifyEmail
  expect(sendMail).toHaveBeenCalledTimes(2);
});
