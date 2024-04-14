const { PutObjectCommand, S3Client } = require("@aws-sdk/client-s3");
const { randomUUID } = require("crypto");
const { readdirSync, statSync, createReadStream } = require("fs");
const s3Client = new S3Client({
  credentials: {
    accessKeyId: "",
    secretAccessKey: "",
  },
  region: "ap-south-1",
});

let projectId = 123;
const editedVideosDirectory = "/app/editedvideos/";
async function putObject(filename) {
  const key = `projects/project${projectId}/edited_videos/${filename}-${randomUUID()}.mp4`;
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

uploadVideos();
