const mongoose = require("mongoose");
async function connectDb(mongoURL, dbName) {
  try {
    await mongoose.connect(mongoURL, { dbName: dbName });
    console.log("Succesfully connected to database to URL: ", mongoURL);
  } catch (error) {
    console.log("Error connecting to database: ");
    throw error;
  }
}

module.exports = { connectDb };
