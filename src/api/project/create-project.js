import connectDb from "../../utils/mongo-connection.js";
import Project from "../../models/Project.js";
import log from "../../utils/log.js";
import { error, success } from "../../utils/response.js";
import { z } from "zod";
import mongoose from "mongoose";
import getUser from "../../utils/get-user.js";
import User from "../../models/User.js";
import jwt from "jsonwebtoken";

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

const SECRET_KEY = process.env.SECRET_KEY;

export async function handler(event, context) {
  try {
    context.callbackWaitsForEmptyEventLoop = false;

    await connectDb();

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
    let parsedToken = null;

    try {
      parsedToken = await getUser(event);
    } catch (err) {
      return error(
        {
          message: "Invalid api request",
        },
        403
      );
    }

    const account = await User.findById(parsedToken._id);

    console.log("Account retrieved: ", log(account._doc));

    const newProject = new Project({
      user_id: account._id,
      title,
      description,
    });

    await newProject.save();

    console.log("Created new project: ", log(newProject._doc));

    account.projects = [...account.projects, newProject._id];

    await account.save();

    console.log("Updated user: ", log(account._doc));

    const accountToken = jwt.sign(account._doc, SECRET_KEY, {
      expiresIn: "10h",
    });

    console.log("Token generated: ", accountToken);

    return success(
      {
        data: newProject,
      },
      200,
      {
        user: {
          value: accountToken,
          path: "/",
          httpOnly: true,
          secure: true,
        },
      }
    );
  } catch (err) {
    console.log(err.message);

    return error(
      {
        message: "Internal error",
      },
      500
    );
  } finally {
    await mongoose.disconnect();
  }
}
