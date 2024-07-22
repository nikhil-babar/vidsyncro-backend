import mongoose, { Schema, model } from "mongoose";

export const ProjectSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  owner_id: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  editors: {
    type: [
      {
        id: {
          type: mongoose.Schema.ObjectId,
          ref: "User",
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        email: {
          type: String,
          required: true,
        },
      },
    ],
  },
});

export default model("Project", ProjectSchema);
