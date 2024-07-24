import mongoose from "mongoose";
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
  projects: {
    type: [
      {
        id: {
          type: mongoose.Schema.ObjectId,
          ref: "Project",
          required: true,
        },
        title: {
          type: String,
          required: true,
        },
        access_type: {
          type: String,
          enum: ["owner", "editor"],
          required: true,
        },
      },
    ],
    default: [],
  },
});

export default model("User", UserSchema);
