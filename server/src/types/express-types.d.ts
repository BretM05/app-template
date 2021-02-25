import { UserDocument } from "../models/User";

// @types/passport defines User interface on Express as {}
// extending that type here with fiels from UserDocument
declare global {
  namespace Express {
    interface User extends UserDocument {
      id?: string;
    }
  }
}
