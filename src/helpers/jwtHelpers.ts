import jwt, { JwtPayload, Secret, SignOptions } from "jsonwebtoken";

const generateToken = (
  payload: any,
  secret: Secret,
  expiresIn: string | number
) => {
  const options: SignOptions = { expiresIn: expiresIn as any };
  const token = jwt.sign(payload, secret, options);
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