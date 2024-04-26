import { s3Client } from "./s3-client.js";
import { GetObjectCommand } from "@aws-sdk/client-s3";

export default async function getVideoStream(key, bucket) {
  try {
    const input = {
      Bucket: bucket,
      Key: key,
    };

    const command = new GetObjectCommand(input);

    const res = await s3Client.send(command);

    return res.Body;
  } catch (error) {
    console.log("Error while reading the stream: ", error.message);
  }
}
