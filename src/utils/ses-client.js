import { SESv2Client } from "@aws-sdk/client-sesv2";

const REGION = process.env.REGION;

export const sesClient = new SESv2Client({
  region: REGION,
});
