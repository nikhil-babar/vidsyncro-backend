import { s3Client } from "../../utils/s3-client.js";
import { ListObjectsCommand } from "@aws-sdk/client-s3";
import log from "../../utils/log.js";
import { error, success } from "../../utils/response.js";
import { z } from "zod";
import { segments, segmentToTaskMapping } from "../../../config/config.js";
import mongoose from "mongoose";
import Project from "../../models/Project.js";
import connectDb from "../../utils/mongo-connection.js";

const VIDEO_BUCKET = process.env.VIDEO_BUCKET;

const getAssetsParameter = z.object({
  project_id: z.custom((val) => mongoose.isObjectIdOrHexString(val), {
    message: "Please provide a valid project id",
  }),
  segment: z.enum(Object.values(segments), {
    required_error: `Segment must be a validate partition: ${Object.values(
      segments
    ).join(",")}`,
  }),
});

connectDb()
  .then(() => console.log("Connected to mongodb"))
  .catch(() => {
    console.log("Failed to connect to mongodb");
  });

export const handler = async (event) => {
  try {
    console.log("Received event: ", log(event));

    const parsed = getAssetsParameter.safeParse(event.queryStringParameters);

    if (!parsed.success) {
      return error(
        {
          message: parsed.error,
        },
        422
      );
    }

    const { project_id, segment } = parsed.data;

    if (segment.localeCompare(segments.assets) === 0) {
      const input = {
        Bucket: VIDEO_BUCKET,
        Prefix: `${project_id}/${segment}`,
      };

      const command = new ListObjectsCommand(input);

      const res = await s3Client.send(command);

      return success(
        {
          data: res.Contents,
        },
        200
      );
    }

    const task_type = segmentToTaskMapping[segment];

    const project = await Project.findById(project_id);

    if (!project) {
      return error(
        {
          message: "Project not found",
        },
        404
      );
    }

    const tasks = project.tasks.filter(
      (e) => e.task.localeCompare(task_type) === 0
    );

    return success(
      {
        data: tasks,
      },
      200
    );
  } catch (err) {
    console.log(err.message);

    return error(
      {
        message: "Internal error",
      },
      500
    );
  }
};
