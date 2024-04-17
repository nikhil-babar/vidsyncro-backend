import connectDb from "../../utils/mongo-connection.js";
import Project from "../../models/Project.js";
import log from "../../utils/log.js";
import { error, success } from "../../utils/response.js";

const MONGO_URL = process.env.MONGO_URL;
const MONGO_DB_NAME = process.env.MONGO_DB_NAME;

connectDb(MONGO_URL, MONGO_DB_NAME)
  .then(() => console.log("Connected to mongodb"))
  .catch(() => {
    console.log("Failed to connect to mongodb");
  });

/*
  INPUT: 

  {
      "title": "Vidsycro",
      "description": "Descriptio of Vidsycro"
  }

  OUTPUT: 

  {
    "data": {
        "title": "Vidsycro",
        "description": "Descriptio of Vidsycro",
        "_id": "661e93bf8944fc883af65ef2",
        "tasks": [],
        "__v": 0
    }
  }

  FLOW:

  Apply checks on title and description
  Create a new Project in database.

*/

export async function handler(event, context) {
  try {
    context.callbackWaitsForEmptyEventLoop = false;

    console.log("Received event: ", log(event));

    const body = JSON.parse(event.body);

    const newProject = new Project({
      title: body.title,
      description: body.description,
    });

    await newProject.save();

    return success(
      {
        data: newProject,
      },
      200
    );
  } catch (err) {
    console.log(err.message);

    return error(
      {
        message: "Internal error",
      },
      500
    );
  }
}