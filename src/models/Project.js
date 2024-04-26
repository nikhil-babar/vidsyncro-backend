import { Schema, SchemaTypes, model } from "mongoose";

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
  tasks: {
    type: [
      {
        task: {
          type: String,
          required: true,
        },
        resource_path: {
          type: [String],
          required: true,
          minlength: 1,
        },
        events: {
          type: SchemaTypes.Mixed,
          default: {},
        },
      },
    ],

    default: [],
  },
});

export default model("Project", ProjectSchema);
