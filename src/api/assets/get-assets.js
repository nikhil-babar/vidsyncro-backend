import { s3Client } from "../../utils/s3-client.js";
import { ListObjectsCommand } from "@aws-sdk/client-s3";
import log from "../../utils/log.js";
import { error, success } from "../../utils/response.js";

const VIDEO_BUCKET = process.env.VIDEO_BUCKET;

export const handler = async (event) => {
  try {
    console.log("Received event: ", log(event));

    const { project_id, segment } = event.queryStringParameters;

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
