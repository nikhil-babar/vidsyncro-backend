import Project from "../../models/Project.js";
import mongoose, { set } from "mongoose";
import User from "../../models/User.js";
import log from "../log.js";

export const createProject = async (title, description, user_id) => {
  let session = null;

  try {
    session = await mongoose.connection.startSession();

    session.startTransaction();

    const newProject = new Project({
      title,
      description,
      owner_id: new mongoose.Types.ObjectId(user_id),
    });

    await newProject.save({ session });

    console.log("Project created: ", log(newProject._doc));

    await User.findByIdAndUpdate(
      user_id,
      {
        $push: {
          projects: {
            id: newProject._id,
            title,
            access_type: "owner",
          },
        },
      },
      { projection: { projects: -1 } }
    );

    await session.commitTransaction();

    return newProject._doc;
  } catch (error) {
    console.log(
      "Error while creating new project with params: ",
      log({
        title,
        description,
        user_id,
      })
    );

    if (session) {
      await session.abortTransaction();
    }

    throw error;
  } finally {
    if (session) {
      session.endSession();
    }
  }
};
