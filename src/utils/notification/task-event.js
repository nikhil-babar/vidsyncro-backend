import { PublishCommand } from "@aws-sdk/client-sns";
import { snsClient } from "../clients/sns-client.js";

const SNS_TOPIC = process.env.SNS_TOPIC;

export default async function addTask(project_id, tasks, metadata) {
  try {
    console.log(project_id, tasks, metadata);

    if (!project_id || !tasks) {
      throw new Error("invalid-parameters");
    }

    const input = {
      TopicArn: SNS_TOPIC,
      Message: JSON.stringify({
        project_id,
        tasks,
        metadata: metadata,
      }),
    };

    const command = new PublishCommand(input);

    const snsRes = await snsClient.send(command);

    return snsRes.MessageId;
  } catch (error) {
    console.log("Error while adding task to sns: ", error.message);

    throw error;
  }
}
