import connectDb from "../../utils/clients/mongo-connection.js";
import log from "../../utils/log.js";
import { error, success } from "../../utils/response.js";
import mongoose from "mongoose";
import { parse } from "../../utils/parser.js";
import { authMiddleware } from "../../utils/users/users.js";
import z from "zod";
import { getProjects } from "../../utils/projects/projects.js";

const getProjectsParameters = z.object({
  page_no: z.coerce.number({
    required_error: "Page no required",
  }),
  page_size: z.coerce.number({
    required_error: "Page size required",
  }),
});

export async function handler(event, context, callback) {
  try {
    context.callbackWaitsForEmptyEventLoop = false;

    await connectDb();

    console.log("Received event: ", log(event));

    const { page_no, page_size } = parse(
      event.queryStringParameters,
      getProjectsParameters,
      callback
    );

    const user = authMiddleware(event, callback);

    console.log("User extracted: ", log(user));

    const projects = await getProjects(user._id, page_no, page_size);

    console.log("Retrived projects: ", log(projects));

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
