import Project from "../../models/Project.js";
import mongoose from "mongoose";
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

export const getProjects = async (user_id, page_no, page_size) => {
  try {
    const start = (page_no - 1) * page_size;

    const res = await User.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(user_id) } },
      { $project: { projects: { $slice: ["$projects", start, page_size] } } },
    ]);

    return res[0]?.projects;
  } catch (error) {
    console.log(
      "Error while getting projects: ",
      log({ user_id, page_no, page_size }),
      error.message
    );
    throw error;
  }
};

export const getAssets = async (
  user_id,
  project_id,
  segment,
  page_no,
  page_size
) => {
  try {
    const project_object_id = new mongoose.Types.ObjectId(project_id);
    const user_object_id = new mongoose.Types.ObjectId(user_id);
    const start = (page_no - 1) * page_size;

    const res = await Project.aggregate([
      {
        $match: {
          _id: project_object_id,
          $or: [
            { owner_id: user_object_id },
            { "editors._id": user_object_id },
          ],
        },
      },
      {
        $project: {
          assets: {
            $slice: [
              {
                $filter: {
                  input: "$assets",
                  as: "asset",
                  cond: { $eq: ["$$asset.segment", segment] },
                },
              },
              start,
              page_size,
            ],
          },
        },
      },
    ]);

    return res[0]?.assets;
  } catch (error) {
    console.log("Error while getting assets", error.message);
    throw error;
  }
};

export const addAsset = async (project_id, metadata) => {
  try {
    await Project.findByIdAndUpdate(project_id, {
      $push: {
        assets: {
          ...metadata,
          project_id: new mongoose.Types.ObjectId(project_id),
          asset_id: metadata.asset_id,
          segment: metadata.segment,
          name: metadata.name,
          key: metadata.key,
        },
      },
    });
  } catch (error) {
    console.log("Error while adding asset to project: ", error.message);
    throw error;
  }
};
