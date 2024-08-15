import connectDb from "../../utils/clients/mongo-connection.js";
import log from "../../utils/log.js";
import { error, success } from "../../utils/response.js";
import { z } from "zod";
import mongoose from "mongoose";
import sendEmail from "../../utils/send-email.js";
import { createAccount, isEmailAvailable } from "../../utils/users/users.js";
import { generateToken } from "../../utils/users/tokens.js";

const API_GATEWAY_URL = process.env.API_GATEWAY_URL;

const createAccountParameters = z
  .object({
    username: z.string({
      required_error: "Plz provide a username",
    }),
    password: z.string({
      required_error: "Plz provide a password",
    }),
    email: z
      .string({
        required_error: "Plz provide a email id",
      })
      .email({
        message: "Plz provide a valid email id",
      }),
  })
  .strict();

export async function handler(event, context) {
  try {
    context.callbackWaitsForEmptyEventLoop = false;

    await connectDb();

    console.log("Received event: ", log(event));

    const parsed = createAccountParameters.safeParse(JSON.parse(event.body));

    if (!parsed.success) {
      return error(
        {
          message: parsed.error,
        },
        422
      );
    }

    const { username, password, email } = parsed.data;

    const available = await isEmailAvailable(email);

    if (!available) {
      return error(
        {
          message: `Account already exists with email: ${email}`,
        },
        422
      );
    }

    const account = await createAccount(username, email, password);

    console.log("User account created: ", log(account));

    // Note: This token will be used for first time singin and email verfication
    const verificationToken = generateToken(account, "10h");

    console.log("Verification token generated: ", log(verificationToken));

    // Note: Email can be resend if it fails.
    // Todo: Create a seperate route for email resend option.
    try {
      const res = await sendEmail(email, {
        subject: "Email verification: Vidsyncro",
        body: `Link: ${API_GATEWAY_URL}/user/v1/verify?code=${verificationToken}`,
      });

      console.log("Email pushed: ", log(res));
    } catch (error) {}

    return success(
      {
        data: {
          ...account,
          password: undefined,
        },
      },
      200
    );
  } catch (err) {
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
