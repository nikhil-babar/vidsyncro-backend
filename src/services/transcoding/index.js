import { mp4ToDash } from "./dash-converter.js";
import { resolve } from "path";
import uploadFolder from "../../utils/upload-folder-s3.js";
import getVideoURL from "../../utils/get-video-url.js";
import connectDb from "../../utils/mongo-connection.js";
import updateEventInTask from "./update-task.js";
import mongoose from "mongoose";

const VIDEO_BUCKET = process.env.VIDEO_BUCKET;
const TASK = JSON.parse(process.env.TASK);
const LOCAL_OUTDIR = resolve(process.cwd(), "output");

/*
  Task: {
    project_id,
    task_id,
    event,
    resource_path,
    output_folder
    output_path
    timestamp
  }
*/

connectDb()
  .then(() => console.log("Connected to mongodb"))
  .catch(() => {
    console.log("Failed to connect to mongodb");
  });

async function init() {
  try {
    await updateEventInTask(TASK.project_id, TASK.task_id, TASK.event, {
      status: "PENDING",
      output: {
        output_path: TASK.output_path,
        bucket: VIDEO_BUCKET,
      },
    });

    try {
      const stream = await getVideoURL(TASK.resource_path, VIDEO_BUCKET);

      await mp4ToDash(stream, LOCAL_OUTDIR);

      await uploadFolder(TASK.output_path, LOCAL_OUTDIR, VIDEO_BUCKET);

      await updateEventInTask(TASK.project_id, TASK.task_id, TASK.event, {
        status: "SUCCESS",
        output: {
          output_path: TASK.output_path,
          bucket: VIDEO_BUCKET,
        },
      });
    } catch (error) {
      await updateEventInTask(TASK.project_id, TASK.task_id, TASK.event, {
        status: "FAILURE",
        output: {
          output_path: TASK.output_path,
          bucket: VIDEO_BUCKET,
        },
      });

      throw error;
    }
  } catch (error) {
    console.log(error.message);
    throw error;
  } finally {
    await mongoose.disconnect();
  }
}

init()
  .then(() => {
    console.log("Completed the transcoding process");
  })
  .catch((err) => console.log("Error while transcoding: ", err.message));
