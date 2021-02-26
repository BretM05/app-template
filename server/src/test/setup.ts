import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";
import { initializeApp } from "../app";

declare global {
  namespace NodeJS {
    interface Global {
      createUser(email: string, password: string): Promise<string[]>;
    }
  }
}

let mongo: any;
let app: any;
beforeAll(async () => {
  process.env.SESSION_SECRET = "asdfasdfasdfasdf";
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

  mongo = new MongoMemoryServer();
  const mongoUri = await mongo.getUri();
  process.env.MONGO_URI = mongoUri;

  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  app = initializeApp();
});

beforeEach(async () => {
  const collections = await mongoose.connection.db.collections();

  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongo.stop();
  await mongoose.connection.close();
});

global.createUser = async (email: string, password: string) => {
  const response = await request(app)
    .post("/api/auth/signup")
    .send({
      email,
      password,
    })
    .expect(201);

  const cookie = response.get("Set-Cookie");

  return cookie;
};

export { app };
