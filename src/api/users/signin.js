import connectDb from "../../utils/mongo-connection.js";
import log from "../../utils/log.js";
import { error, success } from "../../utils/response.js";
import { z } from "zod";
import mongoose from "mongoose";
import { getUserByEmail, isCorrectPassword } from "../../utils/users/users.js";
import { generateAccessAndRefreshToken } from "../../utils/users/tokens.js";

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

    const account = await getUserByEmail(email);

    if (!account) {
      return error(
        {
          message: "Account not found",
        },
        404
      );
    }

    console.log("Account retrieved: ", log(account));

    if (!account.verified) {
      console.log("Unverified account: ", log(account));
      return error(
        {
          message: "Unverfied account",
        },
        404
      );
    }

    if (!(await isCorrectPassword(account, password))) {
      return error(
        {
          message: "Password doesn't match",
        },
        403
      );
    }

    console.log("Password matched");

    const tokens = generateAccessAndRefreshToken(account);

    console.log("Tokens generated: ", log(tokens));

    return success(
      {
        data: {
          ...account,
          password: undefined,
        },
        access_token: tokens.accessToken,
      },
      200,
      {
        user: {
          value: tokens.refreshToken,
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
