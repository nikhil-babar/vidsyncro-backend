import { HeadObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "../clients/s3-client.js";

const BUCKET = process.env.VIDEO_BUCKET;

export const getMetadata = async (key) => {
  try {
    const input = {
      Bucket: BUCKET,
      Key: key,
    };

    const command = new HeadObjectCommand(input);

    const res = await s3Client.send(command);

    return res.Metadata;
  } catch (error) {
    console.log("Error while getting the metadata: ", error.message);

    throw error;
  }
};
