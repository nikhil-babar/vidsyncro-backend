import { s3Client } from "../../utils/s3-client.js";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { success, error } from "../../utils/response.js";
import { v4 as uuid } from "uuid";
import { z } from "zod";
import { segments } from "../../../config/config.js";
import mongoose from "mongoose";
import getUser from "../../utils/get-user.js";
import log from "../../utils/log.js";

const VIDEO_BUCKET = process.env.VIDEO_BUCKET;
const URL_EXPIRATION_SECONDS = process.env.URL_EXPIRATION_SECONDS;

const postAssetsParameter = z.object({
  files: z
    .array(
      z.object({
        project_id: z.custom((val) => mongoose.isObjectIdOrHexString(val), {
          message: "Please provide a valid project id",
        }),
        segment: z.enum(Object.values(segments), {
          required_error: `Segment must be a validate partition: ${Object.values(
            segments
          ).join(",")}`,
        }),
        name: z.string({
          required_error: "Plz provide a valid file name",
        }),
      }),
      {
        required_error: "Plz provide a array of files to be uploaded",
      }
    )
    .min(1),
});

export const handler = async (event) => {
  try {
    console.log("Request received: ", event);

    const parsed = postAssetsParameter.safeParse(JSON.parse(event.body));

    if (!parsed.success) {
      return error(
        {
          message: parsed.error,
        },
        422
      );
    }

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

    console.log("Retrieved token: ", log(parsedToken));

    const { files } = parsed.data;

    const randomId = uuid().replace("-", "");

    const urls = await Promise.all(
      files.map(async (file) => {
        const input = {
          Bucket: VIDEO_BUCKET,
          Key: `${file.project_id}/${file.segment}/${randomId}_${file.name}`,
        };

        const command = new PutObjectCommand(input);

        const url = await getSignedUrl(s3Client, command, {
          expiresIn: URL_EXPIRATION_SECONDS,
        });

        return {
          url,
          ...input,
        };
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
  } finally {
    await mongoose.disconnect();
  }
};
