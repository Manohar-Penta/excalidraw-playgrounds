import { type Request, type Response, type NextFunction } from "express";
import { verify } from "jsonwebtoken";
import "dotenv/config";
import { HttpStatusCode } from "axios";
import { JWT_SECRET } from "@repo/backend-common/config";

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token = req.headers["authorization"] ?? "";
    // if (!token) token = req.headers["Authorization"] ?? "";

    const decoded = verify(token, JWT_SECRET) as {
      userId: string;
    };

    req.userId = decoded.userId;

    next();
  } catch (e) {
    res.status(HttpStatusCode.Unauthorized).json({ msg: "Unauthorised!!" });
  }
};
