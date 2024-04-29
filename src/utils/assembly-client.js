import { AssemblyAI } from "assemblyai";

const ASSEMBLY_API_KEY = process.env.ASSEMBLY_API_KEY;

export const client = new AssemblyAI({
  apiKey: ASSEMBLY_API_KEY,
});
