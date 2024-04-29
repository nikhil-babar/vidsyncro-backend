import { s3Client } from "../../utils/s3-client.js";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { success, error } from "../../utils/response.js";
import { v4 as uuid } from "uuid";
import { z } from "zod";
import { segments } from "../../../config/config.js";
import mongoose from "mongoose";

const VIDEO_BUCKET = process.env.VIDEO_BUCKET;
const URL_EXPIRATION_SECONDS = process.env.URL_EXPIRATION_SECONDS;

/*
INPUT: 

{
      "files": [
          {
              "project_id": "661e93bf8944fc883af65ef2",
              "segment": "files",
              "name": "vidsyncro.mp4",
              "content_type": "video/mp4"
          }
        ]
  }
  
  OUTPUT:
  
  {
      "urls": [
          "https://vidsyncro-videos-bucket.s3.us-east-2.amazonaws.com/661e93bf8944fc883af65ef2/files/bef699fe0e6c-494a-b6db-be843fc9eda9_vidsyncro.mp4?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAQRS7MOG5TT4CBUC6%2F20240416%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Date=20240416T150622Z&X-Amz-Expires=1000&X-Amz-Signature=24e030e3480a6b59e7eade1f97cf56d2e587fc60194daea0fe52a161ed59b344&X-Amz-SignedHeaders=host&x-id=PutObject"
      ]
  }

  FLOW:
  
  Traverse all the files 
  Create a random id
  Create a unique key using the random id and according to segment and project_id specified
  Create a put signed url
  Return array of signed urls
  
  */

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
