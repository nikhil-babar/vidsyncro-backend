import { s3Client } from "../../utils/s3-client.js";
import { ListObjectsCommand } from "@aws-sdk/client-s3";
import log from "../../utils/log.js";
import { error, success } from "../../utils/response.js";
import { z } from "zod";
import { projectDirectory } from "../../../config/config.js";
import mongoose from "mongoose";

const VIDEO_BUCKET = process.env.VIDEO_BUCKET;

const getAssetsParameter = z.object({
  project_id: z.custom((val) => mongoose.isObjectIdOrHexString(val), {
    message: "Please provide a valid project id",
  }),
  segment: z.enum(Object.values(projectDirectory), {
    required_error: `Segment must be a validate partition: ${Object.values(
      projectDirectory
    ).join(",")}`,
  }),
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

    const input = {
      Bucket: VIDEO_BUCKET,
      Prefix: `${project_id}/${segment}`,
    };

    const command = new ListObjectsCommand(input);

    const res = await s3Client.send(command);

    return success(
      {
        contents: res.Contents,
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
