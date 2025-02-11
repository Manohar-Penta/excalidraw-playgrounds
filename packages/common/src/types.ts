import { z } from "zod";

const CreateUserSchema = z.object({
  email: z.string().min(3).max(40),
  name: z.string().min(3).max(20).optional(),
  password: z.string().min(6).max(20),
});

const SigninSchema = z.object({
  email: z.string().min(3).max(40),
  password: z.string().min(6).max(20),
});

const CreateRoomSchema = z.object({
  roomName: z.string().min(3).max(30),
});

export { CreateUserSchema, SigninSchema, CreateRoomSchema };
