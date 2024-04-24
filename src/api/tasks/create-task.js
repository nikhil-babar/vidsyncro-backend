import Project from "../../models/Project.js";
import { success, error } from "../../utils/response.js";
import log from "../../utils/log.js";
import connectDb from "../../utils/mongo-connection.js";
import { taskToEventMapping } from "../../../config/config.js";
import { snsClient } from "../../utils/sns-client.js";
import { PublishCommand } from "@aws-sdk/client-sns";
import mongoose from "mongoose";
import { z } from "zod";

const SNS_TOPIC = process.env.SNS_TOPIC;

connectDb()
  .then(() => console.log("Connected to mongodb"))
  .catch(() => {
    console.log("Failed to connect to mongodb");
  });

/*
  INPUT: 

  {
    "project_id": "661e93bf8944fc883af65ef2",
    "resource_path": "661e93bf8944fc883af65ef2/files/bef699fe0e6c-494a-b6db-be843fc9eda9_vidsyncro.mp4",
    "task": "publish_pipeline"
  }

  OUTPUT:

  {
    "data": {
        "_id": "661e93bf8944fc883af65ef2",
        "title": "Vidsycro",
        "description": "Descriptio of Vidsycro",
        "tasks": [
            {
                "task": "publish_pipeline",
                "resource_path": [
                    "/files/bef699fe0e6c-494a-b6db-be843fc9eda9_vidsyncro.mp4"
                ],
                "events": {
                    "transcoding": {
                        "status": "QUEUED",
                        "resource_path": "/files/bef699fe0e6c-494a-b6db-be843fc9eda9_vidsyncro.mp4",
                        "project_id": "661e93bf8944fc883af65ef2",
                        "task_id": "661e943d8f40b75177301a5d"
                    }
                },
                "_id": "661e943d8f40b75177301a5d"
            }
        ],
        "__v": 1
    }
  }

  CONFIG:

  taskToEventMapping: A Main task like publishing a video will have multiple subtask(events) which are to be run parallel. This is a mapping object for the same

  FLOW:

  Get the project from Database
  APPLY checks like if project exist or task exist or not
  Create a sns notification and add the events corresponding to a task so that sns can applying filtering policies and send those subtask to their corresponding queue
  Create a new task in tasks array of the project.
  Update the events in that task as queued tasks
  Save the documents

*/

const createTaskParameter = z
  .object({
    project_id: z.custom((val) => mongoose.isObjectIdOrHexString(val), {
      message: "Please provide a valid project id",
    }),
    task: z.enum(Object.keys(taskToEventMapping), {
      required_error: `Task must be one of the following: ${Object.keys(
        taskToEventMapping
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
      TopicArn: SNS_TOPIC,
      Message: JSON.stringify({
        events: taskToEventMapping[task].events,
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

    taskToEventMapping[task].events.forEach(
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
