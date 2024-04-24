import log from "../../utils/log.js";
import { error, success } from "../../utils/response.js";
import { z } from "zod";
import connectDb from "../../utils/mongo-connection.js";
import Project from "../../models/Project.js";
import mongoose from "mongoose";

const getTasksParameter = z
  .object({
    project_id: z.custom((val) => mongoose.isObjectIdOrHexString(val), {
      message: "Please provide a valid project id",
    }),
  })
  .strict();

connectDb()
  .then(() => {
    console.log("Connected to mongodb");
  })
  .catch((err) => {
    console.log("Error while connecting to mongodb: ", err.message);
  });

export const handler = async (event, context) => {
  try {
    context.callbackWaitsForEmptyEventLoop = false;

    console.log("Received event: ", log(event));

    const parsed = getTasksParameter.safeParse(event.queryStringParameters);

    if (!parsed.success) {
      return error(
        {
          message: parsed.error,
        },
        422
      );
    }

    const { project_id } = parsed.data;

    const project = await Project.findById(project_id);

    if (!project) {
      return error(
        {
          message: "Project not found",
        },
        422
      );
    }

    return success(
      {
        tasks: project.tasks,
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
