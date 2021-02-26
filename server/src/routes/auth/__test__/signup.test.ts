import request from "supertest";
import { app } from "../../../test/setup";

it("responds 201 on successful signup with user object in response body", async () => {
  const response = await request(app)
    .post("/api/auth/signup")
    .send({
      email: "test@test.com",
      password: "password",
    })
    .expect(201);

  expect(response.body.user).toBeDefined();
});

it("responds 400 if already logged in", async () => {
  const userCookie = await global.createUser("test@test.com", "password");
  const response = await request(app)
    .post("/api/auth/signup")
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
    .post("/api/auth/signup")
    .send({
      email: "notavalidemail",
      password: "password",
    })
    .expect(400);

  expect(response.body.errors[0].message).toEqual("Must provide a valid email");
});

it("responds 400 if provided invalid password", async () => {
  const response = await request(app)
    .post("/api/auth/signup")
    .send({
      email: "test@test.com",
      password: "p",
    })
    .expect(400);

  expect(response.body.errors[0].message).toEqual(
    "Password must be at least 8 characters"
  );
});

it("responds 400 if missing email or password", async () => {
  const response1 = await request(app)
    .post("/api/auth/signup")
    .send({
      email: "test@test.com",
    })
    .expect(400);

  const response2 = await request(app)
    .post("/api/auth/signup")
    .send({
      password: "alskjdfa",
    })
    .expect(400);

  expect(response1.body.errors[0].message).toEqual(
    "Password must be at least 8 characters"
  );
  expect(response2.body.errors[0].message).toEqual(
    "Must provide a valid email"
  );
});

it("responds 400 if email already exists", async () => {
  await request(app)
    .post("/api/auth/signup")
    .send({
      email: "test@test.com",
      password: "password",
    })
    .expect(201);

  const response = await request(app)
    .post("/api/auth/signup")
    .send({
      email: "test@test.com",
      password: "anotherpassword",
    })
    .expect(400);

  expect(response.body.errors[0].message).toEqual("Email already in use");
});

it("sets a cookie after successful signup", async () => {
  const response = await request(app)
    .post("/api/auth/signup")
    .send({
      email: "test@test.com",
      password: "password",
    })
    .expect(201);
  expect(response.get("Set-Cookie")).toBeDefined();
});
