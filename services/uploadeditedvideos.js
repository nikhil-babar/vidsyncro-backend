const { PutObjectCommand, S3Client } = require("@aws-sdk/client-s3");
const { randomUUID } = require("crypto");
const { readdirSync, statSync, createReadStream } = require("fs");
const updateTaskEvent = require("../models/updateproject.js");
const s3Client = new S3Client({
  credentials: {
    accessKeyId: "",
    secretAccessKey: "",
  },
  region: "ap-south-1",
});

const TASK = JSON.parse(process.env.TASK);
const editedVideosDirectory = "/app/editedvideos/";
async function putObject(filename) {
  const key = `projects/project${
    TASK.project_id
  }/timeline/${filename}-${randomUUID()}.mp4`;
  const command = new PutObjectCommand({
    Bucket: "assets-edl",
    Key: key,
    Body: createReadStream(`${editedVideosDirectory}/${filename}`),
  });

  try {
    const response = await s3Client.send(command);
    console.log(response);
    return response;
  } catch (err) {
    console.error(err);
  }
}

async function uploadVideos() {
  try {
    const files = readdirSync(editedVideosDirectory);
    for (const file of files) {
      const stats = statSync(`${editedVideosDirectory}/${file}`);
      if (stats.isFile()) {
        console.log(`Uploading ${file} to S3...`);
        const url = await putObject(file);
        console.log(`Uploaded ${file}. URL: ${url}`);
      }
    }
    console.log("All videos uploaded successfully.");
  } catch (error) {
    console.error("Error uploading videos:", error);
  }
}

async function init() {
  try {
    await updateTaskEvent(TASK.project_id, TASK.task_id, TASK.event, {
      status: "SUCCESS",
      output: {
        output_path: TASK.output_path,
        bucket: VIDEO_BUCKET,
      },
    });

    await uploadVideos()
      .then(() => {
        console.log("Succesfully uploaded the rough cut");
      })
      .catch((err) => {
        console.log("Could not complete the Rough Cut Edit: ", err);
      });
  } catch (error) {
    console.log(error.message);
    throw error;
  } finally {
    await mongoose.disconnect();
  }
}

init()
  .then(() => {
    console.log("Task succesfully Succeded");
  })
  .catch((err) => {
    console.log("Task Failed to Succed: ", err);
  });