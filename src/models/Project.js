import { Schema, model } from "mongoose";

export const ProjectSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  user_id: {
    type: String,
    required: true,
  },
  editor_ids: {
    type: String,
  },
});

export default model("Project", ProjectSchema);
