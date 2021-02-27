import crypto from "crypto";

export const createRandomToken = (size: number = 16) => {
  return crypto.randomBytes(size).toString("hex");
};
