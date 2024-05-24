import connectDb from "../../utils/mongo-connection.js";
import log from "../../utils/log.js";
import { error, success } from "../../utils/response.js";
import { z } from "zod";
import mongoose from "mongoose";
import Project from "../../models/Project.js";
import jwt from "jsonwebtoken";
import sendEmail from "../../utils/send-email.js";
import getUser from "../../utils/get-user.js";

const SECRET_KEY = process.env.SECRET_KEY;
const API_GATEWAY_URL = process.env.API_GATEWAY_URL;

const sendInvitationParameters = z
  .object({
    message: z.string({
      required_error: "Plz provide a message",
    }),
    project_id: z.custom((val) => mongoose.isObjectIdOrHexString(val), {
      message: "Please provide a valid project id",
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

    const parsed = sendInvitationParameters.safeParse(JSON.parse(event.body));

    if (!parsed.success) {
      return error(
        {
          message: parsed.error,
        },
        422
      );
    }

    const { project_id, message, email } = parsed.data;

    let parsedToken = null;

    try {
      parsedToken = await getUser(event);
    } catch (err) {
      console.log("Error while parsing token: ", err.message);
      return error(
        {
          message: "Invalid api request",
        },
        403
      );
    }

    console.log("Retrieved Token: ", log(parsedToken));

    if (!parsedToken.projects?.includes(project_id)) {
      return error(
        {
          message: "You are not authorized to access this project",
        },
        422
      );
    }

    const project = await Project.findById(
      new mongoose.Types.ObjectId(project_id)
    );

    if (!project) {
      return error(
        {
          message: "Project not found",
        },
        404
      );
    }

    if (project.invitations.find((e) => e.email.localeCompare(email) === 0)) {
      return error(
        {
          message: "Invitation already exists",
        },
        422
      );
    }

    console.log("Project retreived: ", log(project._doc));

    const invitationId = new mongoose.Types.ObjectId();

    const invitation = {
      _id: invitationId,
      email,
      message,
      project_id,
      accepted: false,
    };

    console.log("Invitation generated: ", log(invitation));

    const invitationToken = jwt.sign(invitation, SECRET_KEY, {
      expiresIn: "10h",
    });

    console.log("Invitation token generated: ", invitationToken);

    const res = await sendEmail(email, {
      subject: "Invitation: Vidsyncro",
      body: `Link: ${API_GATEWAY_URL}/invitation/v1/accept-invitation?code=${invitationToken}`,
    });

    console.log("Email pushed: ", log(res));

    project.invitations.push(invitation);

    await project.save();

    console.log("Project updated: ", log(project._doc));

    return success(
      {
        data: {
          invitation,
        },
      },
      200
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
