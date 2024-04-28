import { HfInference } from "@huggingface/inference";
import { writeFile } from "fs/promises";

const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;
const client = new HfInference(HUGGINGFACE_API_KEY);

export default async function generateThumnail(
  title,
  description,
  thumbnail_ideas,
  outputFolder
) {
  try {
    const res = await client.textToImage({
      model: "stabilityai/stable-diffusion-xl-base-1.0",
      inputs: JSON.stringify(
        `Video title: ${title}, Description of video: ${description}, Thumbnail ideas: ${thumbnail_ideas}`
      ),
      parameters: {
        width: 1280,
        height: 720,
      },
    });

    // Assuming res contains the image data as a Blob object

    // Convert the Blob object to a Buffer
    const buffer = await res.arrayBuffer();
    const imageBuffer = Buffer.from(buffer);

    // Write the Buffer to a file
    await writeFile(`${outputFolder}/thumbnail.png`, imageBuffer);
  } catch (error) {
    console.error("Error while generating thumbnail:", error);
    throw error;
  }
}
