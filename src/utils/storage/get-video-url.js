import { s3Client } from "./s3-client.js";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export default async function getVideoURL(key, bucket) {
  try {
    const input = {
      Bucket: bucket,
      Key: key,
    };

    const command = new GetObjectCommand(input);

    const url = await getSignedUrl(s3Client, command);

    return url;
  } catch (error) {
    console.log("Error while reading the stream: ", error.message);
  }
}
