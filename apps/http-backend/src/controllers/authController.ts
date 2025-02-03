import express, { Request, Response } from "express";
import { auth } from "../middlewares/auth";
import {
  CreateRoomSchema,
  CreateUserSchema,
  SigninSchema,
} from "@repo/common/zod-schemas";
import { sign } from "jsonwebtoken";
import "dotenv/config";
import { JWT_SECRET } from "@repo/backend-common/config";
import { prisma } from "@repo/db";
import { HttpStatusCode } from "axios";

const app: express.Router = express.Router();

app.post("/signin", async (req, res) => {
  try {
    const { email, password } = SigninSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email, password },
    });

    if (!user) throw "Invalid Details!!";

    const token = sign({ userId: user.id }, JWT_SECRET);
    res.status(200).json({ token });
  } catch (error) {
    console.log(error);
    res.status(HttpStatusCode.BadRequest).json({ msg: "Invalid Credentials" });
  }
});

app.post("/signup", async (req, res) => {
  try {
    const data = CreateUserSchema.parse(req.body);

    const user = await prisma.user.create({
      data: { ...data },
    });

    // console.log(JWT_SECRET);
    const token = sign({ userId: user.id }, JWT_SECRET);
    res.status(200).json({ token });
  } catch (e) {
    console.log(e);
    res
      .status(400)
      .json({ msg: "Invalid Credentials or Email Already in Use!!" });
  }
});

export default app;
