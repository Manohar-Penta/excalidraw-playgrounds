import { WebSocketServer, type WebSocket } from "ws";
import { verify } from "jsonwebtoken";
// import "dotenv/config";
import { JWT_SECRET } from "@repo/backend-common/config";
import { prisma } from "@repo/db";

const wss = new WebSocketServer({ port: 8080 });

const rooms: Record<string, WebSocket[]> = {};
const userRooms: Record<string, string[]> = {};

wss.on("connection", (ws: WebSocket, req) => {
  try {
    const url = req.url;
    const queryParams = new URLSearchParams(url?.split("?")[1]);
    const token = queryParams.get("token") ?? "";

    const data = verify(token, JWT_SECRET) as {
      userId: string;
    };

    ws.userId = data.userId;
    if (!userRooms[ws.userId]) userRooms[ws.userId] = [];
  } catch (e) {
    console.log(e);
    ws.send("Not authorised");
    ws.close();
    return;
  }

  ws.on("close", () => {
    userRooms[ws.userId]?.forEach((room) => {
      // @ts-expect-error
      const index = rooms[room].indexOf(ws);
      // @ts-expect-error
      if (index > -1) rooms[room].splice(index, 1);
      console.log(ws.userId, "left", room);
    });
    // console.log("deleting user", ws.userId);
    delete userRooms[ws.userId];
  });

  ws.on("message", async (raw) => {
    let data;
    try {
      data = JSON.parse(raw.toString());
    } catch (error) {
      ws.send("Invalid Request Object!!");
      return;
    }

    const {
      type,
      room,
      message,
    }: {
      type: string;
      room: string;
      message?: string;
    } = data;

    // console.log(type, room, message);

    if (!type || !room) {
      ws.send("Invalid Request!!");
      return;
    }

    switch (type) {
      case "joinRoom":
        try {
          const data = await prisma.room.findUnique({
            where: {
              id: parseInt(room),
            },
          });

          if (!data) throw "Room doesn't exist";

          if (!rooms[room]) rooms[room] = [];
          if (rooms[room].indexOf(ws) === -1) {
            // console.log(ws.userId, "joined", room);
            rooms[room].push(ws);
          }
          // @ts-expect-error
          if (userRooms[ws.userId].indexOf(room) === -1) {
            // @ts-expect-error
            userRooms[ws.userId].push(room);
          }
          ws.send(`Joined the room ${room}`);
        } catch (e) {
          ws.send("Room doesn't exist");
        }
        break;
      case "leaveRoom":
        if (!rooms[room]) ws.send("Room doesn't exist");
        else {
          const index = rooms[room].indexOf(ws);
          if (index > -1) {
            rooms[room].splice(index, 1);
            // console.log(ws.userId, "left", room);
          }
          if (userRooms[ws.userId]) {
            const index2 = userRooms[ws.userId]?.indexOf(room) as number;
            if (index2 > -1) {
              userRooms[ws.userId]?.splice(index2, 1);
              // console.log(ws.userId, "left2", room);
            }
          }
          ws.send(`Left the room ${room}`);
        }
        break;
      case "messageRoom":
        try {
          if (!rooms[room] || !message) {
            ws.send("Invalid Request!!");
            return;
          }

          const { shape } = JSON.parse(message);
          if (shape == "clear") {
            await prisma.chat.deleteMany({
              where: {
                roomId: parseInt(room),
              },
            });
          } else {
            await prisma.chat.create({
              data: {
                userId: ws.userId,
                message,
                roomId: parseInt(room),
              },
            });
          }

          // console.log("message is being sent!!");

          rooms[room].forEach((client) => {
            if (client === ws) return;
            client.send(message);
          });
        } catch (e) {
          console.log(e);
          ws.send("Room doesn't exist");
        }
        break;
      default:
        ws.send("Invalid Request!!");
    }
  });
});
