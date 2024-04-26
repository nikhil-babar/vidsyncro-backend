const { Schema, SchemaTypes, model } = require("mongoose");

const ProjectSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
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

module.exports = model("Project", ProjectSchema);
