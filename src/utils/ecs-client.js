import { ECSClient } from "@aws-sdk/client-ecs";

const REGION = process.env.REGION;

export const ecsClient = new ECSClient({
  region: REGION,
});
