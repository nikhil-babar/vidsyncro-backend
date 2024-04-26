const {
  S3Client,
  GetObjectCommand,
  ListObjectsCommand,
} = require("@aws-sdk/client-s3");
const { join } = require("path");

const { readdirSync } = require("fs");

const s3Client = new S3Client({
  credentials: {
    accessKeyId: "",
    secretAccessKey: "",
  },
  region: "ap-south-1",
});
const uploadsFolderDocker = "/app/uploads/";
const edlFolderDocker = "/app/parsedEDL/";
const TASK = JSON.parse(process.env.TASK);
async function listRequiredVideosS3() {
  const clipNames = await readEdl();
  const requiredVideos = [];

  for (const clipName of clipNames) {
    const prefix = `projects/${TASK.project_id}/files/${clipName}`;
    const command = new ListObjectsCommand({
      Bucket: "assets-edl",
      Prefix: prefix,
    });
    try {
      const response = await s3Client.send(command);
      if (response.Contents && response.Contents.length > 0) {
        const filenames = response.Contents.map((c) => c.Key);
        requiredVideos.push(...filenames);
      } else {
        console.log(`No video files found for clip ${clipName}`);
      }
    } catch (error) {
      console.error("Error:", error);
      return "Error occurred while listing Video files.";
    }
  }

  return requiredVideos;
}

async function downloadAndWriteVideos() {
  try {
    const requiredVideos = await listRequiredVideosS3();
    const uploadsFolder = uploadsFolderDocker; //../uploads/
    console.log("List of all required Videos: ", requiredVideos);

    // Download all videos concurrently and wait for all to finish
    await Promise.all(
      requiredVideos.map(async (video) => {
        console.log("Processing video: ", video);
        const key = video;

        const filename = key.split("/").pop();
        const filePath = join(uploadsFolder, filename);

        await downloadVideo(key, filePath);
      })
    );

    console.log("All videos downloaded successfully");
  } catch (err) {
    console.error(`Error downloading videos:`, err);
  }
}

async function downloadVideo(key, filePath) {
  const command = new GetObjectCommand({
    Bucket: "assets-edl",
    Key: key,
  });

  try {
    const { Body } = await s3Client.send(command);
    const fileStream = require("fs").createWriteStream(filePath);
    await new Promise((resolve, reject) => {
      Body.pipe(fileStream).on("error", reject).on("close", resolve);
    });
    console.log(`Downloaded ${key} to ${filePath}`);
  } catch (error) {
    console.error("Error downloading video:", error);
  }
}

async function readEdl() {
  let clipNames = [];
  try {
    const edlFolder = edlFolderDocker; //../parsedEDL/
    const edlFiles = await readdirSync(edlFolder);
    console.log("EDL files:", edlFiles);
    for (const edlFile of edlFiles) {
      const filePath = join(edlFolder, edlFile);
      const edlContent = require("fs").readFileSync(filePath, "utf-8");
      const parsedEdl = JSON.parse(edlContent);

      for (const edit of parsedEdl.edits) {
        let clipName = edit.clipName;
        clipNames.push(clipName);
      }
    }
  } catch (err) {
    console.error("Error reading EDL files:", error);
  }
  return clipNames;
}

downloadAndWriteVideos();
