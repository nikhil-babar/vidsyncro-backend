import Project from "../../models/Project.js";
import { success, error } from "../../utils/response.js";
import log from "../../utils/log.js";
import connectDb from "../../utils/mongo-connection.js";
import { taskToEventMapping, tasks } from "../../../config/config.js";
import { snsClient } from "../../utils/sns-client.js";
import { PublishCommand } from "@aws-sdk/client-sns";
import mongoose from "mongoose";
import { z } from "zod";
import getUser from "../../utils/get-user.js";

const SNS_TOPIC = process.env.SNS_TOPIC;

const createTaskParameter = z
  .object({
    project_id: z.custom((val) => mongoose.isObjectIdOrHexString(val), {
      message: "Please provide a valid project id",
    }),
    task: z.enum(Object.keys(tasks), {
      required_error: `Task must be one of the following: ${Object.keys(
        tasks
      ).join(",")}`,
    }),
    resource_path: z.string({
      required_error: "Plz provide a resource",
    }),
  })
  .strict();

export async function handler(event, context) {
  try {
    context.callbackWaitsForEmptyEventLoop = false;

    console.log("Received event: ", log(event));

    await connectDb();

    const parsed = createTaskParameter.safeParse(JSON.parse(event.body));

    if (!parsed.success) {
      return error(
        {
          message: parsed.error,
        },
        422
      );
    }

    const { project_id, task, resource_path } = parsed.data;

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

    console.log("Retrieved Token: ", log(parsedToken));

    console.log(resource_path.split("/"));

    if (
      !parsedToken.projects?.includes(project_id) ||
      resource_path.split("/")[0].localeCompare(project_id) !== 0
    ) {
      return error(
        {
          message: "You are not authorized to access this project",
        },
        422
      );
    }

    const project = await Project.findOne({
      user_id: parsedToken._id,
      _id: new mongoose.Types.ObjectId(project_id),
    });

    if (!project) {
      return error(
        {
          message: "Project not found",
        },
        404
      );
    }

    console.log("Project retreived: ", log(project._doc));

    const task_id = new mongoose.Types.ObjectId();

    const input = {
      TopicArn: SNS_TOPIC,
      Message: JSON.stringify({
        project_id,
        user_id: parsedToken._id,
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

    taskToEventMapping[task].forEach(
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
        data: newTask,
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
  } finally {
    await mongoose.disconnect();
  }
}
