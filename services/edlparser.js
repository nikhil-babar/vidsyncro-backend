//this code fetches all edl file urls from S3, and parses EDL files one by one and store it locally

const {
  S3Client,
  GetObjectCommand,
  ListObjectsCommand,
} = require("@aws-sdk/client-s3");

const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { writeFile } = require("fs");

const edlFolderDocker = "/app/parsedEDL/";

const s3Client = new S3Client({
  credentials: {
    accessKeyId: "",
    secretAccessKey: "",
  },
  region: "ap-south-1",
});

const projectId = "project123";

async function listEdlFiles() {
  const prefix = `projects/${projectId}/timeline/edlfile`;
  const command = new ListObjectsCommand({
    Bucket: "assets-edl",
    Prefix: prefix,
    MaxKeys: 2,
  });

  try {
    const response = await s3Client.send(command);
    if (response.Contents) {
      const filenames = response.Contents.map((c) => c.Key);
      return filenames;
    } else {
      return "No EDL files found.";
    }
  } catch (error) {
    console.error("Error:", error);
    return "Error occurred while listing EDL files.";
  }
}

async function getObjectUrl(key) {
  const command = new GetObjectCommand({
    Bucket: "assets-edl",
    Key: key,
  });
  const url = await getSignedUrl(s3Client, command);
  return url;
}

function parseEDL(edlContent) {
  const lines = edlContent.trim().split("\n");
  const parsedEDL = {
    title: "",
    edits: [],
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Parse title
    if (line.startsWith("TITLE:")) {
      parsedEDL.title = line.substring(line.indexOf(":") + 1).trim();
    }
    // Parse edits
    else if (line.match(/^\d+\s+\w+\s+\w+\s+\w+\s+\S+\s+\S+\s+\S+\s+\S+$/)) {
      const fields = line.split(/\s+/);
      const edit = {
        reel: fields[0],
        track: fields[1],
        transition: fields[2],
        cut: fields[3],
        sourceIn: fields[4],
        sourceOut: fields[5],
        recordIn: fields[6],
        recordOut: fields[7],
        clipName: "",
      };

      // Extract clip name
      const nextLine = lines[i + 1].trim();
      if (nextLine.startsWith("* FROM CLIP NAME:")) {
        edit.clipName = nextLine.substring(nextLine.indexOf(":") + 1).trim();
      }

      parsedEDL.edits.push(edit);
    }
  }

  return parsedEDL;
}

async function downloadAndParseEDLFiles() {
  try {
    const edlFiles = await listEdlFiles();

    for (const filename of edlFiles) {
      console.log("Processing EDL file:", filename);
      const edlContent = await getObjectUrl(filename);
      console.log(edlContent);
      const response = await fetch(edlContent);
      const edlContentText = await response.text();
      const parsedEDL = parseEDL(edlContentText);

      if (parsedEDL.title === "") {
        console.log(
          `Couldn't fetch file ${filename} as it may be empty or untraceable`
        );
      } else {
        console.log("Parsed EDL:", parsedEDL);
        const jsonData = JSON.stringify(parsedEDL, null, 2);
        await writeFile(
          `${edlFolderDocker}${filename.split("/").pop()}.json`, //../parsedEDL/
          jsonData,
          (err) => {
            if (err) throw err;
            console.log("The file has been saved!");
          }
        );
      }
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

downloadAndParseEDLFiles();
