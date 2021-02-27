import request from "supertest";
import { User } from "../../../models/User";
import { app } from "../../../test/setup";

it("responds 404 if token is not provided as param", async () => {
  await request(app).get("/api/auth/verifyEmail/").send().expect(404);
});

it("responds 404 if no user found for token", async () => {
  await request(app)
    .get("/api/auth/verifyEmail/notAValidToken")
    .send()
    .expect(404);
});

it("responds 400 and removes token if user email is already verified", async () => {
  const user = User.build({ email: "test@test.com", password: "password" });

  // manually set token and verified flag for test
  user.email_verify_token = "1234abcd";
  user.email_is_verified = true;

  await user.save();

  const response = await request(app)
    .get("/api/auth/verifyEmail/1234abcd")
    .send()
    .expect(400);

  expect(response.body.errors[0].message).toEqual("Email already verified");

  const updatedUser = await User.findById(user.id);
  expect(updatedUser?.email_verify_token).toBe(undefined);
});

it("logs user in after successful email verification", async () => {
  const user = User.build({ email: "test@test.com", password: "password" });

  // manually set token for test
  user.email_verify_token = "1234abcd";
  await user.save();

  const response = await request(app)
    .get("/api/auth/verifyEmail/1234abcd")
    .send()
    .expect(200);
  expect(response.get("Set-Cookie")).toBeDefined();
});

it("updates fields and returns user after successful email verification", async () => {
  const user = User.build({ email: "test@test.com", password: "password" });

  // manually set token for test
  user.email_verify_token = "1234abcd";
  await user.save();

  const response = await request(app)
    .get("/api/auth/verifyEmail/1234abcd")
    .send()
    .expect(200);
  expect(response.body.user.email).toEqual("test@test.com");

  const updatedUser = await User.findById(user.id);
  expect(updatedUser?.email_is_verified).toBeTruthy();
  expect(updatedUser?.email_verify_token).toBeUndefined();
});
