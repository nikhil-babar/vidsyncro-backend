import { Schema, model } from "mongoose";

export const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  verified: {
    type: Boolean,
    default: false,
  },
});

export default model("User", UserSchema);
