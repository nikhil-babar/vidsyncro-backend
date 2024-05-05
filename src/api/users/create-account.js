import connectDb from "../../utils/mongo-connection.js";
import log from "../../utils/log.js";
import { error, success } from "../../utils/response.js";
import { z } from "zod";
import mongoose from "mongoose";
import User from "../../models/User.js";
import jwt from "jsonwebtoken";
import sendEmail from "../../utils/send-email.js";

const SECRET_KEY = process.env.SECRET_KEY;
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

    const exists = await User.exists({ email: email });

    if (exists) {
      return error(
        {
          message: `Account already exists with email: ${email}`,
        },
        422
      );
    }

    const account = new User({
      username,
      password,
      email,
    });

    await account.save();

    console.log("User account created");

    const accountToken = jwt.sign(account._doc, SECRET_KEY, {
      expiresIn: "10h",
    });

    console.log("Auth token generated: ", accountToken);

    const res = await sendEmail(email, {
      subject: "Email verification: Vidsyncro",
      body: `Link: ${API_GATEWAY_URL}/user/v1/verify?code=${accountToken}`,
    });

    console.log("Email pushed: ", log(res));

    return success(
      {
        data: {
          ...account._doc,
          password: undefined,
        },
      },
      200,
      {
        user: {
          value: accountToken,
          path: "/",
          httpOnly: true,
        },
      }
    );
  } catch (err) {
    console.log(err.message);

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
