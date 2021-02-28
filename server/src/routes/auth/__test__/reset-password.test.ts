import request from "supertest";
import { User } from "../../../models/User";
import { app } from "../../../test/setup";

it("responds 400 if missing password or token", async () => {
  const response1 = await request(app)
    .post("/api/auth/resetPassword")
    .send({ token: "12345678" })
    .expect(400);

  const response2 = await request(app)
    .post("/api/auth/resetPassword")
    .send({ password: "anewpassword" })
    .expect(400);

  expect(response1.body.errors[0].message).toEqual("Must provide a password");
  expect(response2.body.errors[0].message).toEqual("Must provide token");
});

it("responds 404 if no user found for token", async () => {
  await request(app)
    .post("/api/auth/resetPassword")
    .send({
      password: "ANewPassword",
      token: "as09d8f7a90s8d",
    })
    .expect(404);
});

it("responds 400 if token is expired or expiration is undefined", async () => {
  await global.createUser("test@test.com", "password");
  const user = await User.findOne({ email: "test@test.com" });
  user!.password_reset_token = "1234";
  user!.password_reset_expires = undefined;
  await user?.save();
  const response1 = await request(app)
    .post("/api/auth/resetPassword")
    .send({ token: "1234", password: "newpassword" })
    .expect(400);
  expect(response1.body.errors[0].message).toEqual(
    "Password reset token expired"
  );

  user!.password_reset_expires = Date.now() - 10000; // expired 10 seconds ago;
  await user?.save();
  const response2 = await request(app)
    .post("/api/auth/resetPassword")
    .send({ token: "1234", password: "newpassword" })
    .expect(400);
  expect(response2.body.errors[0].message).toEqual(
    "Password reset token expired"
  );
});

it("unsets token/expiration and returns user object", async () => {
  await global.createUser("test@test.com", "password");
  const user = await User.findOne({ email: "test@test.com" });
  user!.password_reset_token = "1234";
  user!.password_reset_expires = Date.now() + 100000;
  await user?.save();
  const response = await request(app)
    .post("/api/auth/resetPassword")
    .send({ token: "1234", password: "newpassword" })
    .expect(200);
  expect(response.body.user.id).toEqual(user!.id);

  const updatedUser = await User.findById(user!.id);
  expect(updatedUser?.password_reset_token).not.toBeDefined();
  expect(updatedUser?.password_reset_expires).not.toBeDefined();
});
