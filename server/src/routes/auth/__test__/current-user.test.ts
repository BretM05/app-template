import request from "supertest";
import { app } from "../../../test/setup";

it("responds 200 with user object in response body", async () => {
  const userCookie = await global.createUser("test@test.com", "password");
  const response = await request(app)
    .get("/api/auth/currentUser")
    .set("Cookie", userCookie)
    .send()
    .expect(200);

  expect(response.body.user).toBeDefined();
  expect(response.body.user.email).toEqual("test@test.com");
});

it("responds 401 if not logged in", async () => {
  const response = await request(app)
    .get("/api/auth/currentUser")
    .send()
    .expect(401);

  expect(response.body.errors[0].message).toEqual("Not authorized");
});
