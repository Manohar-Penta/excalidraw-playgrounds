import * as ws from "ws";

declare module "ws" {
  export interface WebSocket {
    userId: string;
  }
}
