import connectDb from "../../utils/mongo-connection.js";
import log from "../../utils/log.js";
import { error, success } from "../../utils/response.js";
import { z } from "zod";
import mongoose from "mongoose";
import User from "../../models/User.js";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.SECRET_KEY;

const signInParameters = z
  .object({
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

    const parsed = signInParameters.safeParse(JSON.parse(event.body));

    if (!parsed.success) {
      return error(
        {
          message: parsed.error,
        },
        422
      );
    }

    const { password, email } = parsed.data;

    const account = await User.findOne({ email });

    if (!account) {
      return error(
        {
          message: "Account not found",
        },
        404
      );
    }

    console.log("Account retrieved: ", log(account));

    if (account.password.localeCompare(password) !== 0) {
      return error(
        {
          message: "Password doesn't match",
        },
        401
      );
    }

    console.log("Password matched");

    const accountToken = jwt.sign(account._doc, SECRET_KEY, {
      expiresIn: "10h",
    });

    console.log("Token generated: ", accountToken);

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
