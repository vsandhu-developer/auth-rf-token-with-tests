import z from "zod";

export const USER_REGISTER_VALIDATIONS = z
  .object({
    username: z.string().min(3),
    email: z.email(),
    password: z.string().min(6),
  })
  .strict();

export const USER_LOGIN_VALIDATIONS = z
  .object({
    username: z.string().min(3).optional(),
    email: z.email().optional(),
    password: z.string().min(6),
  })
  .refine((data) => data.username || data.email, {
    message: "Either username or email is required",
    path: [],
  })
  .strict();
