import log from "../../utils/log.js";
import { error, success } from "../../utils/response.js";
import { z } from "zod";
import connectDb from "../../utils/mongo-connection.js";
import Project from "../../models/Project.js";
import mongoose from "mongoose";
import getUser from "../../utils/get-user.js";

const getTasksParameter = z
  .object({
    project_id: z.custom((val) => mongoose.isObjectIdOrHexString(val), {
      message: "Please provide a valid project id",
    }),
  })
  .strict();

export const handler = async (event, context) => {
  try {
    context.callbackWaitsForEmptyEventLoop = false;

    await connectDb();

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

    let parsedToken = null;

    try {
      parsedToken = await getUser(event);
    } catch (err) {
      return error(
        {
          message: "Invalid api request",
        },
        403
      );
    }

    console.log("Retrieved Token: ", log(parsedToken));

    if (!parsedToken.projects?.includes(project_id)) {
      return error(
        {
          message: "You are not authorized to access this project",
        },
        422
      );
    }

    const project = await Project.findOne({
      user_id: parsedToken._id,
      _id: new mongoose.Types.ObjectId(project_id),
    });

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
        data: project.tasks,
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
  } finally {
    await mongoose.disconnect();
  }
};
