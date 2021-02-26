import request from "supertest";
import { app } from "../../../test/setup";

it("responds 200 on successful login with user object in response body", async () => {
  await global.createUser("test@test.com", "password");

  const response = await request(app)
    .post("/api/auth/login")
    .send({
      email: "test@test.com",
      password: "password",
    })
    .expect(200);

  expect(response.body.user).toBeDefined();
  expect(response.body.user.email).toEqual("test@test.com");
});

it("responds 400 if already logged in", async () => {
  const userCookie = await global.createUser("test@test.com", "password");
  const response = await request(app)
    .post("/api/auth/login")
    .set("Cookie", userCookie)
    .send({
      email: "test1@test.com",
      password: "password1",
    })
    .expect(400);

  expect(response.body.errors[0].message).toEqual("Already logged in");
});

it("responds 400 if provided invalid email", async () => {
  const response = await request(app)
    .post("/api/auth/login")
    .send({
      email: "notavalidemail",
      password: "password",
    })
    .expect(400);

  expect(response.body.errors[0].message).toEqual("Must provide a valid email");
});

it("responds 401 if provided incorrect email or password", async () => {
  await global.createUser("test@test.com", "password");

  await request(app)
    .post("/api/auth/login")
    .send({
      email: "test1@test.com",
      password: "password",
    })
    .expect(401);

  await request(app)
    .post("/api/auth/login")
    .send({
      email: "test@test.com",
      password: "pa$$word",
    })
    .expect(401);
});

it("responds 400 if missing email or password", async () => {
  const response1 = await request(app)
    .post("/api/auth/login")
    .send({
      email: "test@test.com",
    })
    .expect(400);

  const response2 = await request(app)
    .post("/api/auth/login")
    .send({
      password: "alskjdfa",
    })
    .expect(400);

  expect(response1.body.errors[0].message).toEqual(
    "You must supply a password"
  );
  expect(response2.body.errors[0].message).toEqual(
    "Must provide a valid email"
  );
});

it("sets a cookie after successful login", async () => {
  await global.createUser("test@test.com", "password");

  const response = await request(app)
    .post("/api/auth/login")
    .send({
      email: "test@test.com",
      password: "password",
    })
    .expect(200);
  expect(response.get("Set-Cookie")).toBeDefined();
});
