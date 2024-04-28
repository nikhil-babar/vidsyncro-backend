import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = "AIzaSyCxH6bP_vPPo66uhiR035JKIP7w2_61k1g";

// Access your API key as an environment variable
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export default async function generateTitleDescriptionFromVtt(vttContent) {
  try {
    // For text-only input, use the gemini-pro model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt1 = `Generate a title for a video based on the following vtt: ${vttContent}`;
    const prompt2 = `Generate a description for a video based on the following vtt: ${vttContent}`;
    const prompt3 = `Generate 3-4 thumbnail idea for a video based on the following vtt: ${vttContent}`;

    const result1 = await model.generateContent(prompt1);
    const result2 = await model.generateContent(prompt2);
    const result3 = await model.generateContent(prompt3);

    const title = result1.response.text();
    const description = result2.response.text();
    const thumbnail = result3.response.text();

    return { title, description, thumbnail };
  } catch (error) {
    console.error("Error:", error);
    throw error.message;
  }
}
