import { Schema, model } from "mongoose";

export const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  projects: {
    type: [Schema.Types.ObjectId],
  },
  editor_access: {
    type: [Schema.Types.ObjectId],
  },
  verified: {
    type: Boolean,
    default: false,
  },
});

export default model("User", UserSchema);
