import { SNSClient } from "@aws-sdk/client-sns";

const REGION = process.env.REGION;

export const snsClient = new SNSClient({
  region: REGION,
});
