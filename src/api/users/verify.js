import connectDb from "../../utils/mongo-connection.js";
import log from "../../utils/log.js";
import { error, success } from "../../utils/response.js";
import { z } from "zod";
import mongoose from "mongoose";
import {
  generateAccessAndRefreshToken,
  verifyToken,
} from "../../utils/users/tokens.js";
import { verifyAccount } from "../../utils/users/users.js";

const verifyAccountParameters = z
  .object({
    code: z.string({
      required_error: "Plz provide a verification code",
    }),
  })
  .strict();

export async function handler(event, context) {
  try {
    context.callbackWaitsForEmptyEventLoop = false;

    await connectDb();

    console.log("Received event: ", log(event));

    const parsed = verifyAccountParameters.safeParse(
      event.queryStringParameters
    );

    if (!parsed.success) {
      return error(
        {
          message: parsed.error,
        },
        422
      );
    }

    const { code } = parsed.data;

    let account = null;

    try {
      account = verifyToken(code);
    } catch (err) {
      return error(
        {
          message: "Invalid code parameter",
        },
        401
      );
    }

    console.log("Account retrieved: ", log(account));

    /*
      Eg account: {
        "email": "xyz@gmail.com",
        "username": "xyz",
        "verified": false,
        "_id": "123",
        "__v": 0
      }
    */

    let updatedAccount = null;

    try {
      updatedAccount = await verifyAccount(account._id);
    } catch (err) {
      if (err.message === "link-already-used")
        return error(
          {
            message: "Unauthorized reuse of link",
          },
          403
        );
      else throw err;
    }

    console.log("Account updated: ", log(updatedAccount));

    const tokens = generateAccessAndRefreshToken(updatedAccount);

    console.log("Tokens generated: ", log(tokens));

    return success(
      {
        data: {
          ...updatedAccount,
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
