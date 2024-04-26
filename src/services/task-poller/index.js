import log from "../../utils/log.js";
import { RunTaskCommand } from "@aws-sdk/client-ecs";
import { ecsClient } from "../../utils/ecs-client.js";
import { queueToTask } from "../../../config/config.js";

const CLUSTER = process.env.CLUSTER;
const CLUSTER_SUBNET = process.env.CLUSTER_SUBNET;
const CLUSTER_SECURITY_GROUP = process.env.CLUSTER_SECURITY_GROUP;

/*
  INPUT: 

{
  "Records": [
    {
      "messageId": "dbe5d8ae-2036-4bff-870e-fe7f8021a496",
      "receiptHandle": "AQEBaklK2K7FLN82WCnOaQ/DHynIFiIHqb154A1gIZ3TvBBa62Y9Vfz/5ptQjX/Vsy3ln3j0X1vnO6y6kC/7FySLQ/vjk6kMDQQL0UYA/9h3xhjtez5pBczypQ75xk9KBN4m3XTTo4DDEnIKfFEicexqxbyQFudToZ9gKyLdsAOEoxp+TFdKumU6PlSWGjtlQeU13EF/WfeA+V8/yCUJluBjVhFrj3L+JZg+CkFPUFWYe1ob8F+yx4rUG6+uBAbhvrI84iHNqHDjeSjy7Lit7gr6Mwqt/60MLI6Jb3u14Wo9cLd6GB4pxWBaFOv01UXZtSNHJysyZjfjJGIPti8egyP34sMLa8bOihnD5gpFaAtmCVmS/iJekx6qr7HVVLo5oJpKOHrORo4mA4YxxqAyTw773g==",
      "body": "{\n  \"Type\" : \"Notification\",\n  \"MessageId\" : \"2882bbe3-aa0c-50a3-be90-e5766835308d\",\n  \"TopicArn\" : \"arn:aws:sns:us-east-2:037781008827:transcoding\",\n  \"Message\" : \"{\\\"events\\\":[\\\"transcoding\\\"],\\\"project_id\\\":\\\"661bbca64ff5ffdb10d958f9\\\",\\\"task\\\":\\\"publish_pipeline\\\",\\\"task_id\\\":\\\"795da20a-18a9-41c5-867d-c7c3963fc413\\\",\\\"resource_path\\\":\\\"/files/vidsyncro2.mp4\\\"}\",\n  \"Timestamp\" : \"2024-04-14T11:37:29.618Z\",\n  \"SignatureVersion\" : \"1\",\n  \"Signature\" : \"BPNCtnNaezcLihGv2BwwziC0N37VDatolFscCCw6M7R9jx0+s2JKrR7yqRlsTAPMnTHalLGtWgyRviKZ0Ahy3Ai7cdCP5MVwJICMv4vdjwNsZp4u3UYNi+jnceEN7HB86K2cBccASZt/bq7Z3q+6zsCweuqPEvj8b42sFefObRDbs1hgUrF1d3LPMOWvVfvb4MT75MFgcJtebiH7NT4VyD9Gw/OS2gQoNP4A1dxNTaE4scLAL9JmZwh/CW2YgqCw0DD1ovBx344Q/RzE6py8uSv1zCwJJXDF3P+lLJt1eYHgaWLmcNWab07iOvn7lQ8k0oE4CPHVSQKGyUr7AVH6dw==\",\n  \"SigningCertURL\" : \"https://sns.us-east-2.amazonaws.com/SimpleNotificationService-60eadc530605d63b8e62a523676ef735.pem\",\n  \"UnsubscribeURL\" : \"https://sns.us-east-2.amazonaws.com/?Action=Unsubscribe&SubscriptionArn=arn:aws:sns:us-east-2:037781008827:transcoding:31d98e03-0b17-42ea-87ce-1a890550ee8e\"\n}",
      "attributes": {
        "ApproximateReceiveCount": "1",
        "SentTimestamp": "1713094649650",
        "SenderId": "AIDAJQR6QDGQ7PATMSYEY",
        "ApproximateFirstReceiveTimestamp": "1713099728875"
      },
      "messageAttributes": {},
      "md5OfBody": "bfa1d6eb081f794421d81edf6bbb806a",
      "eventSource": "aws:sqs",
      "eventSourceARN": "arn:aws:sqs:us-east-2:037781008827:transcoding",
      "awsRegion": "us-east-2"
    }
  ]
}


  CONFIG:

  IMP: Plz give ecs full access to this function until the bug with sam ecs run task policy is not solved
  
  queueToDirectoryMapping: Each queue represents a task and must have a output directory within the same project directory
  queueToTask: Each queue will have its corresponding ecs task image and task name
  queueToEventMapping: Maps sqs queue to its task (event)

  FLOW: 

  Traverse the records
  For each record, get its file name and create a output path for the task using queueToDirectoryMapping
  RUN the ecs task with TASK environment variable set

*/

export const handler = async (event, context) => {
  try {
    context.callbackWaitsForEmptyEventLoop = false;

    console.log("Received event: ", log(event));

    for (const record of event.Records) {
      try {
        const body = JSON.parse(record.body);
        const message = JSON.parse(body.Message);

        const queue = body.TopicArn.split(":").at(-1);

        if (!Object.keys(queueToTask).includes(queue)) {
          throw `No details found corresponding to queue: ${queue}`;
        }

        const { resource_path, project_id } = message;
        const { output_directory, task, task_image, event } =
          queueToTask[queue];

        const file = resource_path.split("/").at(-1);
        const output_path = `${project_id}/${output_directory}/${file}`;

        const config = {
          ...message,
          output_path,
          output_directory,
          event,
        };

        console.log("Configuration of task: ", config);

        const command = new RunTaskCommand({
          cluster: CLUSTER,
          taskDefinition: task,
          launchType: "FARGATE",
          count: 1,
          networkConfiguration: {
            awsvpcConfiguration: {
              subnets: [CLUSTER_SUBNET],
              securityGroups: [CLUSTER_SECURITY_GROUP],
              assignPublicIp: "ENABLED",
            },
          },
          overrides: {
            containerOverrides: [
              {
                name: task_image,
                environment: [
                  {
                    name: "TASK",
                    value: JSON.stringify(config),
                  },
                ],
              },
            ],
          },
        });

        const ecsRes = await ecsClient.send(command);

        console.log("Task intiatied: ", log(ecsRes.$metadata));
      } catch (err) {
        console.log("Error while initiating tasks: ", err.message);
      }
    }
  } catch (err) {
    console.log("Error while initiating tasks: ", err.message);
  }
};
