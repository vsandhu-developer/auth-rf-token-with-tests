import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../config/db.config";

const RefreshToken = process.env.JWT_REFRESH_TOKEN!;
const AccessToken = process.env.JWT_ACCESS_TOKEN!;

interface JwtUserPayload {
  id: string;
  username: string;
  email: string;
}

interface JwtUserPayloadRefresh {
  id: string;
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const accessToken = req.cookies.access_token;
    const refreshToken = req.cookies.refresh_token;

    if (accessToken) {
      try {
        const decoded = jwt.verify(accessToken, AccessToken) as JwtUserPayload;
        req.user = decoded;
        return next();
      } catch (err) {}
    }

    if (refreshToken) {
      let decoded: JwtUserPayloadRefresh;

      try {
        decoded = jwt.verify(refreshToken, RefreshToken) as any;
      } catch (err) {
        return res.status(401).json({ message: "Invalid refresh token", err });
      }

      const storedUser = await prisma.user.findFirst({
        where: { refreshToken: refreshToken },
      });

      if (!storedUser) {
        return res.status(401).json({ message: "Refresh token not found" });
      }

      const newAccessToken = jwt.sign(
        { id: decoded.id, email: storedUser.email },
        AccessToken,
        { expiresIn: "15m" }
      );

      res.cookie("access_token", newAccessToken, {
        httpOnly: true,
        maxAge: 15 * 60 * 1000,
        secure: true,
        sameSite: "strict",
      });

      req.user = decoded as JwtUserPayload;
      return next();
    }

    return res.status(401).json({ message: "Unauthorized" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
