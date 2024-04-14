import { createReadStream } from "fs";
import { readdir, lstat } from "fs/promises";
import { join } from "path";
import mimeTypes from "mime-types";
import { s3Client } from "./s3-client.js";
import { PutObjectCommand } from "@aws-sdk/client-s3";

export default async function uploadFolder(folderKey, folderPath, bucket) {
  try {
    const dashPackage = await readdir(folderPath, { recursive: true });

    for (const content of dashPackage) {
      const contentPath = join(folderPath, content);

      if ((await lstat(contentPath)).isDirectory()) continue;

      const input = {
        Bucket: bucket,
        Key: `${folderKey}/${content}`,
        ContentType: mimeTypes.lookup(content),
        Body: createReadStream(contentPath),
      };

      const command = new PutObjectCommand(input);

      await s3Client.send(command);

      console.log("Uploaded: ", content);
    }
  } catch (error) {
    console.log("Error while reading the package: ", error.message);
  }
}
