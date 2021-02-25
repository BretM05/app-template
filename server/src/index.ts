import "dotenv/config";
import mongoose from "mongoose";
import { app } from "./app";

const start = async () => {
  console.log("Starting up...");

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI must be defined");
  }
  if (!process.env.PORT) {
    throw new Error("PORT must be defined");
  }
  if (!process.env.SESSION_SECRET) {
    throw new Error("SESSION_SECRET must be defined");
  }

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    console.log("Connected to MongoDB.");
  } catch (err) {
    console.error(err);
  }

  app.listen(process.env.PORT, () => {
    console.log(`Listening on port ${process.env.PORT}...`);
  });
};

start();
