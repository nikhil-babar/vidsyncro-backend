import connectDb from "../../utils/mongo-connection.js";
import log from "../../utils/log.js";
import { error, success } from "../../utils/response.js";
import { z } from "zod";
import mongoose from "mongoose";
import User from "../../models/User.js";
import Project from "../../models/Project.js";
import jwt from "jsonwebtoken";
import getUser from "../../utils/get-user.js";

const SECRET_KEY = process.env.SECRET_KEY;

const acceptInvitationParameters = z
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

    const parsed = acceptInvitationParameters.safeParse(
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
    let invitation = null;

    try {
      invitation = jwt.verify(code, SECRET_KEY);
    } catch (err) {
      console.log(err.message);
      return error(
        {
          message: "Invalid code parameter",
        },
        401
      );
    }

    console.log("Invitation retrieved: ", log(invitation));

    const project = await Project.findById(
      new mongoose.Types.ObjectId(invitation?.project_id)
    );

    if (!project) {
      return error(
        {
          message: "Project not found",
        },
        404
      );
    }

    console.log("Project retreived: ", log(project._doc));

    const inv = project.invitations.find(
      (e) => invitation._id.localeCompare(e._id.toString()) === 0
    );

    if (!inv) {
      return error(
        {
          message: "Invitation not found",
        },
        404
      );
    }

    if (inv.accepted) {
      return error(
        {
          message: "Invitation already excepted",
        },
        422
      );
    }

    inv.accepted = true;

    await project.save();

    console.log("Project updated: ", log(project._doc));

    let parsedToken = null;

    try {
      parsedToken = await getUser(event);
    } catch (err) {}

    const account = await User.findOne({ email: invitation.email });

    console.log("Account retrieved: ", log(account._doc));

    account.projects.push(new mongoose.Types.ObjectId(invitation.project_id));

    await account.save();

    console.log("Updated account: ", log(account._doc));

    if (!parsedToken) {
      return success(
        {
          data: {
            project: project._doc,
          },
        },
        200
      );
    }

    const accountToken = jwt.sign(account._doc, SECRET_KEY, {
      expiresIn: "10h",
    });

    console.log("Token generated: ", accountToken);

    return success(
      {
        data: {
          invitation: project.invitations.find(
            (inv) => invitation?._id.localeCompare(inv._id.toString()) === 0
          ),
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
