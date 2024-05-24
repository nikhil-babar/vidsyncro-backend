import log from "./log.js";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.SECRET_KEY;

export default async function getUser(event) {
  try {
    const cookies = event?.headers?.Cookie;

    if (!cookies) throw new Error("No cookies available");

    // Parse cookies
    const cookiesArray = cookies.split(";").map((cookie) => cookie.trim());
    const userCookie = cookiesArray.find((cookie) =>
      cookie.startsWith("user=")
    );

    if (!userCookie) throw new Error("No user cookie set");

    const token = userCookie.split("=")[1];

    const user = jwt.verify(token, SECRET_KEY);

    console.log("Extracted token: ", log(user));

    if (!user || !user.verified) throw new Error("User not verified");

    return user;
  } catch (err) {
    console.log("Error while retrieving the user: ", err.message);
    throw err;
  }
}
