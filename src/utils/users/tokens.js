import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.SECRET_KEY;
const ACCESS_TOKEN_EXPIRY = "1000s";
const REFRESH_TOKEN_EXPIRY = "10h";

export const generateToken = (payload, expiresIn) => {
  const token = jwt.sign(payload, SECRET_KEY, {
    expiresIn: expiresIn,
  });
  return token;
};

export const generateAccessAndRefreshToken = (payload) => {
  const accessToken = generateToken(payload, ACCESS_TOKEN_EXPIRY);
  const refreshToken = generateToken(payload, REFRESH_TOKEN_EXPIRY);
  return { accessToken, refreshToken };
};
