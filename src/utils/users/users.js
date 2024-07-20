import User from "../../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { error } from "../response.js";
import log from "../log.js";

const SECRET_KEY = process.env.SECRET_KEY;

export const isEmailAvailable = async (email) => {
  try {
    const exists = await User.exists({ email: email });
    return !exists;
  } catch (error) {
    console.log(
      `Error while checking availabiltiy of email: ${email} => ${error.message}`
    );
    throw error;
  }
};

export const getUserByEmail = async (email) => {
  try {
    const account = await User.findOne({ email: email });
    return account._doc;
  } catch (error) {
    console.log(
      `Error while find account for email: ${email} => ${error.message}`
    );
    throw error;
  }
};

export const verifyAccount = async (account_id) => {
  try {
    const account = await User.findByIdAndUpdate(account_id, {
      verified: true,
    });

    if (account.verified) {
      throw new Error("link-already-used");
    }

    return account._doc;
  } catch (error) {
    console.log(
      `Error while verifying the account with id: ${account_id} => ${error.message}`
    );
    throw error;
  }
};

export const createAccount = async (username, email, password) => {
  try {
    const hash = await bcrypt.hash(password, 10);

    const account = new User({
      username,
      password: hash,
      email,
    });

    await account.save();

    return account._doc;
  } catch (error) {
    console.log(
      `Error while creating account for params: ${{
        username,
        email,
        password,
      }} => ${error.message}`
    );
    throw error;
  }
};

export const isCorrectPassword = async (account, password) => {
  try {
    const res = await bcrypt.compare(password, account.password);
    return res;
  } catch (error) {
    console.log(
      `Error while verifying password for account: ${account} => ${error.message}`
    );
    throw error;
  }
};

export const authMiddleware = (event, callback) => {
  /*
    callback: lambda callback to directly respond from the function and not catch the error in main code.
    Note: throw the err after invoking callback because calling callback doesn't terminate the execution.
  */
  try {
    const authHeader = event?.headers?.Authorization?.split(" ");

    if (!authHeader || authHeader.length != 2) throw new Error("no-auth-token");

    const token = authHeader[1];

    let user = null;

    try {
      user = jwt.verify(token, SECRET_KEY);
    } catch (err) {
      console.log("Error while verifying token: ", err.message);
      throw new Error("user-not-authorized");
    }

    console.log("Extracted token: ", log(user));

    if (!user || !user.verified) throw new Error("user-not-verified");

    return user;
  } catch (err) {
    console.log("Error while retrieving the user: ", err.message);

    callback(
      undefined,
      error(
        {
          message: "user-not-authorized",
        },
        401
      )
    );

    throw err;
  }
};
