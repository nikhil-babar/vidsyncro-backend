import { SendEmailCommand } from "@aws-sdk/client-sesv2";
import { sesClient } from "./ses-client.js";

const EMAIL = process.env.EMAIL;
const SES_IDENTITY_ARN = process.env.SES_IDENTITY_ARN;

export default async function sendEmail(destination, content) {
  try {
    const input = {
      Content: {
        Simple: {
          Subject: {
            Data: content.subject,
          },
          Body: {
            Text: {
              Data: content.body,
            },
          },
        },
      },
      FromEmailAddress: EMAIL,
      FromEmailAddressIdentityArn: SES_IDENTITY_ARN,
      Destination: {
        ToAddresses: [destination],
      },
    };

    const command = new SendEmailCommand(input);
    const res = await sesClient.send(command);

    return res.$metadata;
  } catch (error) {
    console.log("Error while sending the message: ", error.message);
    throw error;
  }
}
