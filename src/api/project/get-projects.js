import connectDb from "../../utils/mongo-connection.js";
import Project from "../../models/Project.js";
import log from "../../utils/log.js";
import { error, success } from "../../utils/response.js";
import { z } from "zod";
import mongoose from "mongoose";

const createProjectParameters = z
  .object({
    user_id: z.string({
      required_error: "Plz provide a userId",
    }),
  })
  .strict();

export async function handler(event, context) {
  try {
    context.callbackWaitsForEmptyEventLoop = false;

    await connectDb();

    console.log("Received event: ", log(event));

    const parsed = createProjectParameters.safeParse(
      event.queryStringParameters
    );

    if (!parsed.success) {
      return error(
        {
          message: parsed.error,
        },
        422
      );
    }

    const { user_id } = parsed.data;

    const projects = await Project.find(
      {
        user_id: user_id,
      },
      {},
      {
        projection: {
          tasks: 0,
        },
      }
    );

    return success(
      {
        data: projects,
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
}
