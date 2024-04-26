const { PutObjectCommand, S3Client } = require("@aws-sdk/client-s3");
const { randomUUID } = require("crypto");
const { readdirSync, statSync, createReadStream } = require("fs");
const path = require("path");

const dotenv = require("dotenv")
dotenv.config()

const s3Client = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  region: "us-east-2",
});

const rawVideosDirectory = ".";
const projectId = process.env.PROJECT_ID;
const s3Bucket = "sandeshawsbucket";
const s3Prefix = `projects/${projectId}/production_video/`;

async function putObject(filename) {
  const key = `${s3Prefix}${path.basename(filename)}-${randomUUID()}${path.extname(filename)}`;
  const command = new PutObjectCommand({
    Bucket: s3Bucket,
    Key: key,
    Body: createReadStream(`${rawVideosDirectory}/${filename}`),
  });

  try {
    const response = await s3Client.send(command);
    console.log(`Uploaded ${filename} to S3. URL: ${response}`);
    return response;
  } catch (err) {
    console.error(`Error uploading ${filename} to S3:`, err);
  }
}

async function uploadFiles() {
  try {
    const files = readdirSync(rawVideosDirectory);
    console.log("files : ",files)
    for (const file of files) {
      const filePath = path.join(rawVideosDirectory, file);
      const stats = statSync(filePath);
      if (stats.isFile() && (path.extname(file) === '.txt' || path.extname(file) === '.srt')) {
        console.log(`Uploading ${file} to S3...`);
        await putObject(file);
      }
    }
    console.log("All files uploaded successfully.");
  } catch (error) {
    console.error("Error uploading files:", error);
  }
}

uploadFiles();
