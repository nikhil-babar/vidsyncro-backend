import mongoose from "mongoose";
import log from "../../utils/log.js";
import connectDb from "../../utils/clients/mongo-connection.js";
import { getMetadata } from "../../utils/storage/get-metadata.js";
import { addAsset } from "../../utils/projects/projects.js";
import {
  segments,
  tasks as segmentToTaskMapping,
} from "../../config/config.js";
import { parse } from "../../utils/parser.js";
import z from "zod";
import addTask from "../../utils/notification/task-event.js";

const putObjectEventParameters = z
  .object({
    project_id: z.custom((val) => mongoose.isObjectIdOrHexString(val), {
      message: "Please provide a valid project id",
    }),
    segment: z.enum(Object.values(segments), {
      required_error: `Segment must be a validate partition: ${Object.values(
        segments
      ).join(",")}`,
    }),
    asset_id: z.string({
      required_error: "Plz provide a valid asset id",
    }),
    name: z.string({
      required_error: "Plz provide a valid file name",
    }),
    key: z.string({
      required_error: "Plz provide a valid key",
    }),
  })
  .strict();

export const handler = async (event, context) => {
  try {
    context.callbackWaitsForEmptyEventLoop = false;

    await connectDb();

    console.log("Received event: ", log(event));

    for (const record of event.Records) {
      const object_key = record.s3.object.key;

      let metadata = null;

      try {
        metadata = await getMetadata(object_key);

        console.log("Metadata received: ", log(metadata));
      } catch (error) {
        console.log(
          "Error while getting the metadata for object: ",
          object_key
        );

        continue;
      }

      const data = parse(metadata, putObjectEventParameters);

      try {
        await addAsset(data.project_id, data);

        console.log("Added asset to the project!");
      } catch (error) {
        console.log("Error while adding the asset for object: ", object_key);

        continue;
      }

      const tasks = segmentToTaskMapping[data.segment];

      if (!tasks || tasks.length === 0) {
        continue;
      }

      try {
        await addTask(data.project_id, tasks, {
          ...data,
        });

        console.log("Added tasks to the asset!");
      } catch (error) {
        console.log("Error while adding the task for object: ", object_key);

        continue;
      }
    }
  } catch (err) {
    console.log(err.message);
  } finally {
    await mongoose.disconnect();
  }
};
