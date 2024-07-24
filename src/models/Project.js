import mongoose, { Schema, model } from "mongoose";
import { segments } from "../config/config.js";

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
  assets: {
    type: [
      {
        project_id: {
          type: mongoose.Schema.ObjectId,
          ref: "Project",
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        segment: {
          type: String,
          required: true,
          enum: Object.values(segments),
        },
        asset_id: {
          type: String,
          required: true,
        },
        key: {
          type: String,
          required: true,
        },
      },
    ],
  },
});

export default model("Project", ProjectSchema);
