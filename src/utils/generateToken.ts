import jwt from "jsonwebtoken";
import { prisma } from "../config/db.config";

export const AccessToken = process.env.ACCESS_TOKEN_SECRET!;
export const RefreshToken = process.env.REFRESH_TOKEN_SECRET!;

export const ACCESS_TOKEN_EXP_MS = 15 * 60 * 1000;
export const REFRESH_TOKEN_EXP_MS = 7 * 24 * 60 * 60 * 1000;

export default async function generateAccessAndRefreshToken(userId: string) {
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new Error("User Not Found");
  }

  const access_token_payload = {
    id: user.id,
    email: user.email,
    username: user.username,
  };

  const refresh_token_payload = {
    id: user.id,
  };

  const access_token = jwt.sign(access_token_payload, AccessToken, {
    expiresIn: ACCESS_TOKEN_EXP_MS / 1000,
  });

  const refresh_token = jwt.sign(refresh_token_payload, RefreshToken, {
    expiresIn: REFRESH_TOKEN_EXP_MS / 1000,
  });

  return { refresh_token, access_token };
}
