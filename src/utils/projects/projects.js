import Project from "../../models/Project.js";

export const createProject = async (title, description, user_id) => {
  try {
    const newProject = new Project({
      title,
      description,
      user_id,
    });

    await newProject.save();

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

    throw error;
  }
};
