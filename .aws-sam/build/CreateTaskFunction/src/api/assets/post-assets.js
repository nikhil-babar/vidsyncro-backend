import { s3Client } from "../../utils/s3-client.js";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { success, error } from "../../utils/response.js";
import { v4 as uuid } from "uuid";

const VIDEO_BUCKET = process.env.VIDEO_BUCKET;
const URL_EXPIRATION_SECONDS = process.env.URL_EXPIRATION_SECONDS;

export const handler = async (event) => {
  try {
    const body = JSON.parse(event.body);

    console.log("Request received: ", body);

    const randomId = uuid().replace("-", "");

    const urls = await Promise.all(
      body.files?.map((file) => {
        const input = {
          Bucket: VIDEO_BUCKET,
          Key: `${file.project_id}/${file.segment}/${randomId}_${file.name}`,
        };

        const command = new PutObjectCommand(input);

        return getSignedUrl(s3Client, command, {
          expiresIn: URL_EXPIRATION_SECONDS,
        });
      })
    );

    return success(
      {
        urls,
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
