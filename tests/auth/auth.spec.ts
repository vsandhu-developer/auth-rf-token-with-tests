import { describe, expect, it, jest, mock } from "bun:test";
import request from "supertest";
import app from "../..";
import { prisma } from "../../src/config/db.config";
import * as authUtils from "../../src/utils/generateToken";

// mock db
mock.module("../../src/config/db.config", () => {
  return {
    prisma: {
      user: {
        create: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
    },
  };
});

describe.skip("Authentication Account Register Tests", () => {
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
  it("should login user successfully", async () => {
    (prisma.user.findFirst as jest.Mock).mockResolvedValue({
      id: "5a576208-6bbd-43cd-8dcd-69c7db35edba",
      username: "tester3333",
      email: "tester3333@gmail.com",
      password: "$2b$12$SRwcpGWancGwo/9s3WXqHu8HblmRdCUcOzqAuYnp.1eXIKvitzW0O",
      refreshToken:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVhNTc2MjA4LTZiYmQtNDNjZC04ZGNkLTY5YzdkYjM1ZWRiYSIsImlhdCI6MTc1NzI4Mjg1MCwiZXhwIjoxNzU3ODg3NjUwfQ.PfhGAn4DStcNYP3_G4PkFAusvwxc44LrBP-jhfzhxco",
      createdAt: "2025-09-07T22:05:54.174Z",
      updatedAt: "2025-09-07T22:05:54.174Z",
    });

    (prisma.user.update as jest.Mock).mockResolvedValue({
      id: "5a576208-6bbd-43cd-8dcd-69c7db35edba",
      refreshToken:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVhNTc2MjA4LTZiYmQtNDNjZC04ZGNkLTY5YzdkYjM1ZWRiYSIsImlhdCI6MTc1NzI4Mjg1MCwiZXhwIjoxNzU3ODg3NjUwfQ.PfhGAn4DStcNYP3_G4PkFAusvwxc44LrBP-jhfzhxco",
    });

    jest.spyOn(authUtils, "default").mockResolvedValue({
      access_token:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVhNTc2MjA4LTZiYmQtNDNjZC04ZGNkLTY5YzdkYjM1ZWRiYSIsImVtYWlsIjoidGVzdGVyMzMzM0BnbWFpbC5jb20iLCJ1c2VybmFtZSI6InRlc3RlcjMzMzMiLCJpYXQiOjE3NTcyODYwMjgsImV4cCI6MTc1NzI4NjkyOH0.8rcj9Z-mcgzR0CLG-hpyvPwZvrlIW2loKDqm6KvVMBk",
      refresh_token:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVhNTc2MjA4LTZiYmQtNDNjZC04ZGNkLTY5YzdkYjM1ZWRiYSIsImlhdCI6MTc1NzI4Mjg1MCwiZXhwIjoxNzU3ODg3NjUwfQ.PfhGAn4DStcNYP3_G4PkFAusvwxc44LrBP-jhfzhxco",
    });

    const response = await request(app).post("/api/v1/auth/login").send({
      username: "tester3333",
      password: "password",
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("message", "User Login Success");
    expect(response.body).toHaveProperty(
      "access_token",
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVhNTc2MjA4LTZiYmQtNDNjZC04ZGNkLTY5YzdkYjM1ZWRiYSIsImVtYWlsIjoidGVzdGVyMzMzM0BnbWFpbC5jb20iLCJ1c2VybmFtZSI6InRlc3RlcjMzMzMiLCJpYXQiOjE3NTcyODYwMjgsImV4cCI6MTc1NzI4NjkyOH0.8rcj9Z-mcgzR0CLG-hpyvPwZvrlIW2loKDqm6KvVMBk"
    );
    expect(response.body).toHaveProperty(
      "refresh_token",
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVhNTc2MjA4LTZiYmQtNDNjZC04ZGNkLTY5YzdkYjM1ZWRiYSIsImlhdCI6MTc1NzI4Mjg1MCwiZXhwIjoxNzU3ODg3NjUwfQ.PfhGAn4DStcNYP3_G4PkFAusvwxc44LrBP-jhfzhxco"
    );
  });

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
