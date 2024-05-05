import connectDb from "../../utils/mongo-connection.js";
import log from "../../utils/log.js";
import { error, success } from "../../utils/response.js";
import { z } from "zod";
import mongoose from "mongoose";
import User from "../../models/User.js";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.SECRET_KEY;

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
      account = jwt.verify(code, SECRET_KEY);
    } catch (err) {
      console.log(err.message);
      return error(
        {
          message: "Invalid code parameter",
        },
        401
      );
    }

    console.log("Account retrieved: ", log(account));

    const updatedAccount = await User.findByIdAndUpdate(account._id, {
      verified: true,
    });

    console.log("Account updated: ", log(updatedAccount));

    const updatedAccountToken = jwt.sign(updatedAccount._doc, SECRET_KEY, {
      expiresIn: "10h",
    });

    console.log("Updated Account token: ", log(updatedAccountToken));

    return success(
      {
        data: {
          ...updatedAccount._doc,
          password: undefined,
        },
      },
      200,
      {
        user: {
          value: updatedAccountToken,
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
