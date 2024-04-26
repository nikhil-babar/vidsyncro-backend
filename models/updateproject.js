const Project = require("./Project.js");

async function updateTaskEvent(projectId, taskId, event, data) {
  try {
    const updatedProject = await Project.findOneAndUpdate(
      {
        _id: projectId,
        "tasks._id": taskId,
      },
      { $set: { [`tasks.$[task].events.${event}`]: data } },
      { new: true, arrayFilters: [{ "task._id": taskId }] }
    );

    if (!updatedProject) {
      throw new Error("Project or task not found");
    }

    console.log("Updated project data: ", updatedProject);

    return updatedProject;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

module.exports = updateTaskEvent;
