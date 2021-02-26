import request from "supertest";
import { app } from "../../../test/setup";

it("responds 200 on successful logout", async () => {
  const userCookie = await global.createUser("test@test.com", "password");
  await request(app)
    .get("/api/auth/logout")
    .set("Cookie", userCookie)
    .send()
    .expect(200);
});

it("responds 401 if not logged in", async () => {
  const response = await request(app)
    .get("/api/auth/logout")
    .send()
    .expect(401);

  expect(response.body.errors[0].message).toEqual("Not authorized");
});

it("responds 401 to subsequent requests after logout", async () => {
  const userCookie = await global.createUser("test@test.com", "password");
  await request(app)
    .get("/api/auth/logout")
    .set("Cookie", userCookie)
    .send()
    .expect(200);

  // attempt request with same cookie. Responds with 401
  // because server session should be destroyed.
  await request(app)
    .get("/api/auth/currentuser")
    .set("Cookie", userCookie)
    .send()
    .expect(401);
});
