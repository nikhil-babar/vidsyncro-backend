import mongoose from "mongoose";

export default async function connectDb(mongoURL, dbName) {
  try {
    await mongoose.connect(mongoURL, {
      dbName: dbName,
    });
  } catch (error) {
    console.log("Error while connecting db");
    throw error;
  }
}
