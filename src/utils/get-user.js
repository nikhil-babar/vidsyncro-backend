import log from "./log.js";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.SECRET_KEY;

export default async function getUser(event) {
  try {
    const cookie = event?.headers?.Cookie;

    if (!cookie) throw new Error("No cookie available");
    if (cookie.split("=")[0] != "user") throw new Error("No user cookie set");

    const token = cookie.split("=")[1];

    const user = jwt.verify(token, SECRET_KEY);

    console.log("Extracted token: ", log(user));

    return user;
  } catch (err) {
    console.log("Error while retrieving the user: ", err.message);
    throw err;
  }
}
