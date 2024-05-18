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
  invitations: {
    type: [
      {
        email: {
          type: String,
          required: true,
        },
        message: {
          type: String,
          required: true,
        },
        project_id: {
          type: String,
          required: true,
        },
        accepted: {
          type: Boolean,
          default: false,
        },
      },
    ],
    default: [],
  },
});

export default model("Project", ProjectSchema);
