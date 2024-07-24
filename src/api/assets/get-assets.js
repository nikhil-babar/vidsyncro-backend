import log from "../../utils/log.js";
import { error, success } from "../../utils/response.js";
import { z } from "zod";
import { segments } from "../../config/config.js";
import mongoose from "mongoose";
import connectDb from "../../utils/clients/mongo-connection.js";
import { parse } from "../../utils/parser.js";
import { getAssets } from "../../utils/projects/projects.js";
import { authMiddleware } from "../../utils/users/users.js";

const getAssetsParameter = z.object({
  project_id: z.custom((val) => mongoose.isObjectIdOrHexString(val), {
    message: "Please provide a valid project id",
  }),
  segment: z.enum(Object.values(segments), {
    required_error: `Segment must be a validate partition: ${Object.values(
      segments
    ).join(",")}`,
  }),
  page_no: z.coerce.number({
    required_error: "Page no required",
  }),
  page_size: z.coerce.number({
    required_error: "Page size required",
  }),
});

export const handler = async (event, context, callback) => {
  try {
    context.callbackWaitsForEmptyEventLoop = false;

    await connectDb();

    console.log("Received event: ", log(event));

    const { project_id, segment, page_no, page_size } = parse(
      event.queryStringParameters,
      getAssetsParameter,
      callback
    );

    const user = authMiddleware(event, callback);

    console.log("User extracted: ", log(user));

    const assets = await getAssets(
      user._id,
      project_id,
      segment,
      page_no,
      page_size
    );

    return success(
      {
        data: assets,
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
