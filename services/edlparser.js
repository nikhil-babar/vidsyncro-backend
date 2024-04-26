//this code fetches all edl file urls from S3, and parses EDL files one by one and store it locally

const {
  S3Client,
  GetObjectCommand,
  ListObjectsCommand,
} = require("@aws-sdk/client-s3");
const { connectDb } = require("../connectdb");
const { writeFile } = require("fs");
//const Project = require("../models/Project.js");
//const { registerProject } = require("../models/registerproejct.js");
const { mongoose } = require("mongoose");
const edlFolderDocker = "/app/parsedEDL/";
const updateTaskEvent = require("../models/updateproject.js");
const s3Client = new S3Client({
  credentials: {
    accessKeyId: "",
    secretAccessKey: "",
  },
  region: "ap-south-1",
});

const projectId = process.env.PROJECT_ID;
const edlFileName = process.env.EDL_FILE_NAME;
const MONGO_DB_NAME = process.env.MONGO_DB_NAME;
const edlFile = `projects/${projectId}/timeline/${edlFileName}`;
const mongoDbURL = process.env.MONGO_DB_URL;
const TASK = JSON.parse(process.env.TASK);
// //connecting database
connectDb(mongoDbURL, MONGO_DB_NAME)
  .then(() => {
    console.log("Succefully connected to mongodb database");
  })
  .catch((err) => {
    console.log("cant connect to db damn ", err);
  });

async function getObjectUrl(key) {
  const command = new GetObjectCommand({
    Bucket: "assets-edl",
    Key: key,
  });
  const url = await s3Client.send(command);
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
    console.log("Processing EDL file:", edlFile);
    const edlContentResponse = await getObjectUrl(edlFile);
    let edlContent = "";
    edlContentResponse.Body.on("data", (chunck) => {
      edlContent += chunck;
    });

    edlContentResponse.Body.on("end", async () => {
      const parsedEDL = parseEDL(edlContent);

      if (parsedEDL.title === "") {
        console.log(
          `Couldn't fetch file ${edlFile} as it may be empty or untraceable`
        );
      } else {
        console.log("Parsed EDL:", parsedEDL);
        const jsonData = JSON.stringify(parsedEDL, null, 2);
        await writeFile(
          `${edlFolderDocker}/${edlFile.split("/").pop()}.json`, //../parsedEDL/
          jsonData,
          (err) => {
            if (err) throw err;
            console.log("The file has been saved!");
            // try {
            //   console.log("ye title hai", parsedEDL.title);
            //   // await registerProject(
            //   //   "Vidsyncro1",
            //   //   "in this project we are editing videos"
            //   //   // ["edl-processing", edlFile, "rrr"]
            //   // );
            // } catch (error) {
            //   console.error("Error registering project:", error);
            // }
          }
        );
      }
    });
  } catch (error) {
    console.error("Error:", error);
  }
}

//const TASK = JSON.parse(process.env.TASK);

async function init() {
  try {
    await updateTaskEvent(TASK.project_id, TASK.task_id, TASK.event, {
      status: "PENDING..",
      output: {
        output_path: TASK.output_path,
        bucket: VIDEO_BUCKET,
      },
    });

    await downloadAndParseEDLFiles()
      .then(() => {
        console.log("Downloading and parsing of EDL files completed");
      })
      .catch((err) => {
        console.log(
          "Could not complete Downloading and parsing of EDL fies: ",
          err
        );
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
    console.log("Task succesfully went to pending state");
  })
  .catch((err) => {
    console.log("Task Failed to go on pending state: ", err);
  });
