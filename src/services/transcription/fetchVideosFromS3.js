const dotenv = require("dotenv")
dotenv.config()

const { S3Client, GetObjectCommand, ListObjectsCommand } = require("@aws-sdk/client-s3");

const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { createWriteStream, mkdirSync } = require("fs");
const { pipeline } = require("stream");
const path = require("path");

const rawVideosFolder = "./downloads";
const projectId = process.env.PROJECT_ID;
const s3Bucket = "sandeshawsbucket";
const s3Prefix = `projects/${projectId}/files`;


const s3Client = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  region: "us-east-2",
});

async function listVideoFiles() {
  const prefix = s3Prefix;
  const command = new ListObjectsCommand({
    Bucket: s3Bucket,
    Prefix: prefix,
  });
  try {
    const response = await s3Client.send(command);
    if (response.Contents) {
      const filenames = response.Contents.map((c) => c.Key).filter((filename) => !filename.endsWith('/'));;
      console.log("returning from ListVideos")
      console.log("filenames : ", filenames)
      return filenames;
    } else {
      return "No video files found.";
    }
  } catch (error) {
    console.error("Error:", error);
    return "Error occurred while listing video files.";
  }

}

async function getObjectUrl(key) {
  const command = new GetObjectCommand({
    Bucket: s3Bucket,
    Key: key,
  });
  const url = await getSignedUrl(s3Client, command);
  console.log("url : ", url);
  return url;
}

async function downloadVideoFiles() {
  console.log("Executing FetchVideosFromS3.js")
  try {
    mkdirSync(rawVideosFolder, { recursive: true });    
    const videoFiles = await listVideoFiles();
    console.log(videoFiles)

    for (const filename of videoFiles) {
      console.log("Downloading video file:", filename);
      const videoUrl = await getObjectUrl(filename);

      const videoFilename = filename.split("/").pop();
      const videoPath = path.join(rawVideosFolder, videoFilename);
      console.log("videopath : ", videoPath)

      const response = await fetch(videoUrl);
      if (!response.ok) {
        throw new Error(`Failed to download video file ${filename}`);
      }

      const fileStream = createWriteStream(videoPath);
      await new Promise((resolve, reject) => {
        pipeline(response.body, fileStream, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });

      console.log(`Video file ${filename} downloaded successfully.`);
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

downloadVideoFiles();
