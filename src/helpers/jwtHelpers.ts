import jwt, { JwtPayload, Secret, SignOptions } from "jsonwebtoken";

const generateToken = (payload: any, secret: Secret, expiresIn: string) => {
  const options: SignOptions = {
    algorithm: "HS256",
    expiresIn,
  };
  const token = jwt.sign(payload, secret as string, options);

  return token;
};

const verifyToken = (token: string, secret: Secret) => {
  const tokenWithoutQuotes = token.replace(/^"|"$/g, "");

  const verifiedUser = jwt.verify(tokenWithoutQuotes, secret) as JwtPayload;

  return verifiedUser;
};

export const jwtHelpers = {
  generateToken,
  verifyToken,
};
