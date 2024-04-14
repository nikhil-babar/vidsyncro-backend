import Project from "../../models/Project.js";
import { success, error } from "../../utils/response.js";
import log from "../../utils/log.js";
import connectDb from "../../utils/mongo-connection.js";
import { tasks } from "../../../config/config.js";
import { snsClient } from "../../utils/sns-client.js";
import { PublishCommand } from "@aws-sdk/client-sns";
import mongoose from "mongoose";

const MONGO_URL = process.env.MONGO_URL;
const MONGO_DB_NAME = process.env.MONGO_DB_NAME;
const TRANSCODING_JOB_TOPIC = process.env.TRANSCODING_JOB_TOPIC;

connectDb(MONGO_URL, MONGO_DB_NAME)
  .then(() => console.log("Connected to mongodb"))
  .catch(() => {
    console.log("Failed to connect to mongodb");
  });

export async function handler(event, context) {
  try {
    context.callbackWaitsForEmptyEventLoop = false;

    console.log("Received event: ", log(event));

    const body = JSON.parse(event.body);

    const { project_id, task, resource_path } = body;

    if (!project_id || !task || !resource_path) {
      return error(
        {
          message: "Invalid parameters",
        },
        422
      );
    }

    if (!Object.keys(tasks).includes(task)) {
      return error(
        {
          message: "Invalid task specified",
        },
        422
      );
    }

    const project = await Project.findById(project_id);

    if (!project) {
      return error(
        {
          message: "Project not found",
        },
        404
      );
    }

    const task_id = new mongoose.Types.ObjectId();

    const input = {
      TopicArn: TRANSCODING_JOB_TOPIC,
      Message: JSON.stringify({
        events: tasks[task].events,
        project_id,
        task,
        task_id,
        resource_path,
      }),
    };

    const command = new PublishCommand(input);

    const snsRes = await snsClient.send(command);

    console.log("Notification pushed: ", snsRes.MessageId);

    const newTask = {
      resource_path,
      task,
      _id: task_id,
      events: {},
    };

    tasks[task].events.forEach(
      (event) =>
        (newTask.events[event] = {
          status: "QUEUED",
          resource_path,
          project_id,
          task_id,
        })
    );

    console.log("Tasked Generated: ", log(newTask));

    project.tasks.push(newTask);

    await project.save();

    return success(
      {
        data: project,
      },
      200
    );
  } catch (err) {
    console.log("Error while creating a task: ", err.message);

    return error(
      {
        message: "Internal error",
      },
      500
    );
  }
}
