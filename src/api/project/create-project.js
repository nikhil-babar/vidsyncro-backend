import connectDb from "../../utils/mongo-connection.js";
import Project from "../../models/Project.js";
import log from "../../utils/log.js";
import { error, success } from "../../utils/response.js";
import { z } from "zod";

connectDb()
  .then(() => console.log("Connected to mongodb"))
  .catch(() => {
    console.log("Failed to connect to mongodb");
  });

const createProjectParameters = z
  .object({
    title: z.string({
      required_error: "Project title must be a string",
    }),
    description: z.string({
      required_error: "Project description must be a string",
    }),
  })
  .strict();

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

    const parsed = createProjectParameters.safeParse(JSON.parse(event.body));

    if (!parsed.success) {
      return error(
        {
          message: parsed.error,
        },
        422
      );
    }

    const { title, description } = parsed.data;

    const newProject = new Project({
      title,
      description,
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
