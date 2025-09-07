import bcrypt from "bcryptjs";
import type { Request, Response } from "express";
import { flattenError, ZodError } from "zod";
import { prisma } from "../config/db.config";
import generateAccessAndRefreshToken, {
  ACCESS_TOKEN_EXP_MS,
  REFRESH_TOKEN_EXP_MS,
} from "../utils/generateToken";
import {
  USER_LOGIN_VALIDATIONS,
  USER_REGISTER_VALIDATIONS,
} from "../validations/auth.validations";

export async function register(req: Request, res: Response) {
  try {
    const body = req.body;
    const payload = USER_REGISTER_VALIDATIONS.parse(body);

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          {
            username: payload.username,
          },
          {
            email: payload.email,
          },
        ],
      },
    });

    if (existingUser) {
      return res.status(400).json({
        message:
          "User with this account already exist. Please try again or Login to your account",
      });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(payload.password, salt);

    const user = await prisma.user.create({
      data: {
        username: payload.username,
        email: payload.email,
        password: hashedPassword,
      },
    });

    return res.status(200).json({ message: "User Account Created", user });
  } catch (error) {
    if (error instanceof ZodError) {
      const zodError = flattenError(error);
      return res
        .status(400)
        .json({ message: "Validation Error", error: zodError });
    } else {
      return res
        .status(400)
        .json({ message: "Error while creating user account", error });
    }
  }
}

export async function login(req: Request, res: Response) {
  try {
    const body = req.body;
    const payload = USER_LOGIN_VALIDATIONS.parse(body);

    const userExist = await prisma.user.findFirst({
      where: {
        OR: [
          {
            username: payload.username,
          },
          {
            email: payload.email,
          },
        ],
      },
    });

    if (!userExist) {
      return res.status(400).json({
        message:
          "User with this account does not exist. Please register and then login to your account",
      });
    }

    const verifyPassword = await bcrypt.compare(
      payload.password,
      userExist.password
    );

    if (!verifyPassword) {
      return res.status(400).json({
        message: "Incorrect Password. Please try again",
      });
    }

    const { access_token, refresh_token } = await generateAccessAndRefreshToken(
      userExist.id
    );

    res.cookie("access_token", access_token, {
      httpOnly: true,
      secure: true,
      expires: new Date(Date.now() + ACCESS_TOKEN_EXP_MS),
    });

    res.cookie("refresh_token", refresh_token, {
      httpOnly: true,
      secure: true,
      expires: new Date(Date.now() + REFRESH_TOKEN_EXP_MS),
    });

    await prisma.user.update({
      where: {
        id: userExist.id,
      },
      data: {
        refreshToken: refresh_token,
      },
    });

    return res
      .status(200)
      .json({ message: "User Login Success", access_token, refresh_token });
  } catch (error) {
    if (error instanceof ZodError) {
      const zodError = flattenError(error);
      return res
        .status(400)
        .json({ message: "Validation Error", error: zodError });
    } else {
      return res
        .status(400)
        .json({ message: "Error while Logging user account", error: error });
    }
  }
}
