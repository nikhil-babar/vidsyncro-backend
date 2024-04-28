import { client } from "../../utils/assembly-client.js";
import { join } from "path";
import { writeFile } from "fs/promises";

const CHARS_PER_CAPTION = 32;

export default async function generateVtt(transcipt, outputFolder) {
  try {
    const vtt = await client.transcripts.subtitles(
      transcipt.id,
      "vtt",
      CHARS_PER_CAPTION
    );

    await writeFile(join(outputFolder, "subtitle.vtt"), vtt);

    return vtt;
  } catch (error) {
    console.log("Error while generating vtt file: ", error.message);
    throw error;
  }
}
