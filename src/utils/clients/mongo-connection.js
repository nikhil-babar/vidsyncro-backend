import mongoose from "mongoose";

const MONGO_URL = process.env.MONGO_URL;
const MONGO_DB_NAME = process.env.MONGO_DB_NAME;

export default async function connectDb() {
  try {
    await mongoose.connect(MONGO_URL, {
      dbName: MONGO_DB_NAME,
    });
  } catch (error) {
    console.log("Error while connecting db");
    throw error;
  }
}
