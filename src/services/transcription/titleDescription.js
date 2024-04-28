const fs = require('fs').promises; // Import the file system module
const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv")
dotenv.config()

// Access your API key as an environment variable
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function run() {
  try {
    // Get a list of files in the current directory
    const files = await fs.readdir('.');
    
    // Filter out only the .srt files
    const srtFiles = files.filter(file => file.endsWith('.srt'));

    for (const file of srtFiles) {
      // Read the contents of the .srt file
      const inputText = await fs.readFile(file, 'utf-8');

      // For text-only input, use the gemini-pro model
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      const prompt1 = `Generate a title for a video based on the following transcript: ${inputText}`;
      const prompt2 = `Generate a description for a video based on the following transcript: ${inputText}`;
      const prompt3 = `Generate 3-4 thumbnail idea for a video based on the following transcript: ${inputText}`;

      const result1 = await model.generateContent(prompt1);
      const result2 = await model.generateContent(prompt2);
      const result3 = await model.generateContent(prompt3);

      const title = (await result1.response.text());
      const description = (await result2.response.text());
      const thumbnail = (await result3.response.text());
      
      // Create separate files for title and description
      const filename = file.replace('.srt', '');
      await fs.writeFile(`${filename}-title.txt`, title);
      await fs.writeFile(`${filename}-description.txt`, description);
      await fs.writeFile(`${filename}-thumbnailIdea.txt`, thumbnail);
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

run();
