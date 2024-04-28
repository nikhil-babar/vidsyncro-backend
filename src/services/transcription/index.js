import getVideoURL from "../../utils/get-video-url.js";
import generateTranscript from "./generate-transcript.js";
import generateVtt from "./generate-vtt.js";
import { resolve } from "path";
import { mkdir } from "fs/promises";
import generateTitleDescriptionFromVtt from "./generate-text.js";
import uploadFolder from "../../utils/upload-folder-s3.js";
import connectDb from "../../utils/mongo-connection.js";
import updateTaskEvent from "../transcoding/update-task.js";
import mongoose from "mongoose";
// import generateThumnail from "./generate-thumnail.js";

const LOCAL_OUTDIR = resolve(process.cwd(), "output");
const VIDEO_BUCKET = process.env.VIDEO_BUCKET;
const TASK = JSON.parse(process.env.TASK);

connectDb()
  .then(() => {
    console.log("Connected to mongodb..");
  })
  .catch((err) => {
    console.log("Error while connecting to mongodb: ", err.message);
  });

async function init() {
  try {
    await updateTaskEvent(TASK.project_id, TASK.task_id, TASK.event, {
      bucket: VIDEO_BUCKET,
      vtt: `${TASK.output_path}/subtitle.vtt`,
    });

    await mkdir(LOCAL_OUTDIR);

    const video_url = await getVideoURL(TASK.resource_path, VIDEO_BUCKET);

    console.log("Generated video url: ", video_url);

    const transcipt = await generateTranscript(video_url);

    console.log("Generated Transcript: ", transcipt);

    const vtt = await generateVtt(transcipt, LOCAL_OUTDIR);

    console.log("Generated vtt: ", vtt);

    const text = await generateTitleDescriptionFromVtt(vtt);

    console.log("Generated text: ", text);

    // await generateThumnail(
    //   text.title,
    //   text.description,
    //   text.thumbnail,
    //   LOCAL_OUTDIR
    // );

    // console.log("Generated thumbnail");

    await uploadFolder(TASK.output_path, LOCAL_OUTDIR, VIDEO_BUCKET);

    console.log("Uploaded to s3..");

    await updateTaskEvent(TASK.project_id, TASK.task_id, TASK.event, {
      bucket: VIDEO_BUCKET,
      vtt: `${TASK.output_path}/subtitle.vtt`,
      ...text,
    });
  } catch (error) {
    throw error;
  } finally {
    await mongoose.disconnect();
  }
}

init()
  .then(() => console.log("Completed processing.."))
  .catch(() => console.log("Failed to process"));
