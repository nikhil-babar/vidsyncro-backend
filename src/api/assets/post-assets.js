import { success, error } from "../../utils/response.js";
import { v4 as uuid } from "uuid";
import { z } from "zod";
import { segments } from "../../config/config.js";
import mongoose from "mongoose";
import log from "../../utils/log.js";
import {
  authMiddleware,
  isAuthorizedToAccessProject,
} from "../../utils/users/users.js";
import { parse } from "../../utils/parser.js";
import { getUploadURL } from "../../utils/storage/get-signed-url.js";
import connectDb from "../../utils/clients/mongo-connection.js";

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

export const handler = async (event, context, callback) => {
  try {
    context.callbackWaitsForEmptyEventLoop = false;

    await connectDb();

    console.log("Received event: ", log(event));

    const { files } = parse(
      JSON.parse(event.body),
      postAssetsParameter,
      callback
    );

    const user = authMiddleware(event, callback);

    console.log("User extracted: ", log(user));

    if (!(await isAuthorizedToAccessProject(user._id, files[0].project_id))) {
      return error(
        {
          message: "unauthorized-project-access",
        },
        403
      );
    }

    const urls = await Promise.all(
      files.map(async (file) => {
        const assetId = uuid().replace(/-/g, "");
        const key = `${file.project_id}/${file.segment}/${assetId}_${file.name}`;

        console.log("Key generated: ", key);

        const url = await getUploadURL(key, {
          ...file,
          asset_id: assetId,
          key,
        });

        console.log("Url generated: ", url);

        return {
          url,
          ...file,
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
