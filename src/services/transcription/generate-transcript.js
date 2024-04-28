import { client } from "../../utils/assembly-client.js";

export default async function generateTranscript(videoUrl) {
  try {
    return await client.transcripts.transcribe({
      audio_url: videoUrl,
    });
  } catch (error) {
    console.log("Error while generating transcript: ", error.message);
    throw error;
  }
}
