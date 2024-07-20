import connectDb from "../../utils/mongo-connection.js";
import log from "../../utils/log.js";
import { error, success } from "../../utils/response.js";
import { z } from "zod";
import mongoose from "mongoose";
import { parse } from "../../utils/parser.js";
import { authMiddleware } from "../../utils/users/users.js";
import { createProject } from "../../utils/projects/projects.js";

const createProjectParameters = z
  .object({
    title: z.string({
      required_error: "Project title must be a string",
    }),
    description: z.string({
      required_error: "Project description must be a string",
    }),
  })
  .strict();

export async function handler(event, context, callback) {
  try {
    context.callbackWaitsForEmptyEventLoop = false;

    await connectDb();

    console.log("Received event: ", log(event));

    const { title, description } = parse(
      JSON.parse(event.body),
      createProjectParameters,
      callback
    );

    const user = authMiddleware(event, callback);

    const project = await createProject(title, description, user._id);

    return success(
      {
        data: project,
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
