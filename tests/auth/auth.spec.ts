import { describe, expect, it, jest, mock } from "bun:test";
import request from "supertest";
import app from "../..";
import { prisma } from "../../src/config/db.config";

// mock db
mock.module("../../src/config/db.config", () => {
  return {
    prisma: {
      user: {
        create: jest.fn(),
        findFirst: jest.fn(),
      },
    },
  };
});

describe("Authentication Account Register Tests", () => {
  it("should register user", async () => {
    (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.user.create as jest.Mock).mockResolvedValue({
      id: "0c28e63a-a311-42b0-92fc-98c97b835404",
      username: "tester",
      email: "test@gmail.com",
      password: "$2b$12$2TDB9olp/GW/PCMWSYh20.Do6MTeWBpftZ8NE/uBb2gFeoKrFtbm2",
      createdAt: "2025-09-07T19:57:36.225Z",
      updatedAt: "2025-09-07T19:57:36.225Z",
    });

    const response = await request(app).post("/api/v1/auth/register").send({
      username: "tester",
      email: "test@gmail.com",
      password: "password",
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("message", "User Account Created");
  });

  it("should fail because user already exist", async () => {
    (prisma.user.findFirst as jest.Mock).mockResolvedValue({
      id: "0c28e63a-a311-42b0-92fc-98c97b835404",
      username: "tester",
      email: "test@gmail.com",
      password: "$2b$12$2TDB9olp/GW/PCMWSYh20.Do6MTeWBpftZ8NE/uBb2gFeoKrFtbm2",
      createdAt: "2025-09-07T19:57:36.225Z",
      updatedAt: "2025-09-07T19:57:36.225Z",
    });

    (prisma.user.create as jest.Mock).mockResolvedValue(null);

    const response = await request(app).post("/api/v1/auth/register").send({
      username: "tester",
      email: "test@gmail.com",
      password: "password",
    });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty(
      "message",
      "User with this account already exist. Please try again or Login to your account"
    );
  });

  it("should throw an validation error", async () => {
    (prisma.user.findFirst as jest.Mock).mockResolvedValue({
      id: "0c28e63a-a311-42b0-92fc-98c97b835404",
      username: "te",
      email: "testgmail.com",
      password: "vall",
      createdAt: "2025-09-07T19:57:36.225Z",
      updatedAt: "2025-09-07T19:57:36.225Z",
    });

    (prisma.user.create as jest.Mock).mockResolvedValue(null);

    const response = await request(app).post("/api/v1/auth/register").send({
      username: "te",
      email: "testgmail.com",
      password: "pass",
    });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message", "Validation Error");
  });

  it("should throw an db", async () => {
    (prisma.user.findFirst as jest.Mock).mockRejectedValue(null);

    (prisma.user.create as jest.Mock).mockRejectedValue(null);

    const response = await request(app).post("/api/v1/auth/register").send({
      username: "testers",
      email: "test@gmail.com",
      password: "password",
    });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty(
      "message",
      "Error while creating user account"
    );
  });
});

describe("Authentication Account Login Tests", () => {
  it("should fail password verification", async () => {
    (prisma.user.findFirst as jest.Mock).mockResolvedValue({
      id: "0c28e63a-a311-42b0-92fc-98c97b835404",
      username: "tester",
      email: "test@gmail.com",
      password: "$2b$12$2TDB9olp/GW/PCMWSYh20.Do6MTeWBpftZ8NE/uBb2gFeoKrFtbm2",
      createdAt: "2025-09-07T19:57:36.225Z",
      updatedAt: "2025-09-07T19:57:36.225Z",
    });

    const response = await request(app).post("/api/v1/auth/login").send({
      username: "tester",
      password: "password2222",
    });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty(
      "message",
      "Incorrect Password. Please try again"
    );
    expect(response.body).toStrictEqual({
      message: "Incorrect Password. Please try again",
    });
  });

  it("should fail because user does not exist", async () => {
    (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);

    const response = await request(app).post("/api/v1/auth/login").send({
      username: "tester",
      password: "password2222",
    });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty(
      "message",
      "User with this account does not exist. Please register and then login to your account"
    );
    expect(response.body).toStrictEqual({
      message:
        "User with this account does not exist. Please register and then login to your account",
    });
  });

  it("should fail because of server error", async () => {
    (prisma.user.findFirst as jest.Mock).mockRejectedValue(null);

    const response = await request(app).post("/api/v1/auth/login").send({
      username: "tester",
      password: "password2222",
    });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty(
      "message",
      "Error while Logging user account"
    );
    expect(response.body).toStrictEqual({
      error: null,
      message: "Error while Logging user account",
    });
  });
});
