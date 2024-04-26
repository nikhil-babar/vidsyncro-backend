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

let projectId = JSON.parse(process.env.PROJECT_ID);
const editedVideosDirectory = "/app/editedvideos/";
async function putObject(filename) {
  const key = `projects/project${projectId}/timeline/${filename}-${randomUUID()}.mp4`;
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
    await updateTaskEvent(
      "661f994553c6f81847f63e0d",
      "661fd0290b2a818d0ac2cd09",
      "edl_process",
      {
        status: "SUCCESS",
        output: {
          output_path:
            "projects/project123/timeline/edlfile-e6ed2fef-5741-45e4-814f-295208e886f5.edl_output.mp4-50189cf8-ab17-471d-8ced-5cea82173167.mp4",
          bucket: "vidsyncro-videos-bucket",
        },
      }
    );

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
