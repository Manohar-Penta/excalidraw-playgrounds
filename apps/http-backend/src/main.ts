import "dotenv/config";
import express, { Request, Response } from "express";
import authController from "./controllers/authController";
import { prisma } from "@repo/db";
import { HttpStatusCode } from "axios";
import { auth } from "./middlewares/auth";
import { CreateRoomSchema } from "@repo/common/zod-schemas";
import cors from "cors";

const app = express();
app.use(cors());

app.use(express.json());

app.use("/api/auth", authController);

app.post("/create-room", auth, async (req: Request, res: Response) => {
  try {
    const data = CreateRoomSchema.parse(req.body);

    const room = await prisma.room.create({
      data: {
        slug: data.roomName,
        userId: req.userId as string,
      },
    });

    res.status(HttpStatusCode.Created).json({ room });
  } catch (error) {
    console.log(error);
    res
      .status(HttpStatusCode.BadRequest)
      .json({ msg: "Invalid Details Provided!!" });
  }
});

app.get("/rooms", auth, async (req: Request, res: Response) => {
  try {
    const pages = await prisma.room.findMany({
      where: { userId: req.userId as string },
      orderBy: { createdAt: "desc" },
    });
    res.status(200).json({ pages });
  } catch (error) {
    res.status(HttpStatusCode.Unauthorized);
  }
});

app.get("/chats/:roomId", async (req, res) => {
  try {
    const chats = await prisma.chat.findMany({
      where: { roomId: parseInt(req.params.roomId as string) },
      orderBy: { id: "asc" },
      take: 50,
    });

    res.status(200).json({ chats });
  } catch (e) {
    res
      .status(HttpStatusCode.BadRequest)
      .json({ msg: "cannot find the room!!" });
  }
});

app.get("/room/:slug", async (req, res) => {
  try {
    const slug = req.params.slug as string;
    const room = await prisma.room.findUnique({
      where: { slug },
    });

    res.send({ room });
  } catch (e) {
    console.log(e);
    res
      .status(HttpStatusCode.BadRequest)
      .json({ msg: "cannot find the room!!" });
  }
});

app.listen(3002, () => {
  console.log("Http Backend started..");
});
