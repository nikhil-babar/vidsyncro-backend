import { s3Client } from "../clients/s3-client.js";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const BUCKET = process.env.VIDEO_BUCKET;
const URL_EXPIRATION_SECONDS = process.env.URL_EXPIRATION_SECONDS;

export const getUploadURL = async (key, metadata) => {
  try {
    const input = {
      Key: key,
      Bucket: BUCKET,
    };

    if (metadata) {
      input.Metadata = metadata;
    }

    const command = new PutObjectCommand(input);

    const url = await getSignedUrl(s3Client, command, {
      expiresIn: URL_EXPIRATION_SECONDS,
    });

    return url;
  } catch (error) {
    console.log("Error while getting the signed url: ", error.message);
    throw error;
  }
};
