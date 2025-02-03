import axios from "axios";

type Shape =
  | {
      type: "rect";
      x: number;
      y: number;
      width: number;
      height: number;
      stoke: string;
      fill: string;
    }
  | {
      type: "circle";
      centerX: number;
      centerY: number;
      radius: number;
      stoke: string;
      fill: string;
    }
  | {
      type: "pencil";
      startX: number;
      startY: number;
      endX: number;
      endY: number;
      stoke: string;
      fill: string;
    };

class Canvas {
  private canvas: HTMLCanvasElement;
  private roomId: string;
  private socket: WebSocket;
  private clicked: boolean;
  private startX: number;
  private startY: number;
  private existingShapes: Shape[];
  private selectedTool: "none" | "rect" | "circle" | "pencil";
  private offsetX: number;
  private offsetY: number;
  private fill: string;
  private stroke: string;

  constructor(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket) {
    this.canvas = canvas;
    this.roomId = roomId;
    this.socket = socket;
    this.clicked = false;
    this.startX = 0;
    this.startY = 0;
    this.existingShapes = [];
    this.selectedTool = "none";
    this.offsetX = 0;
    this.offsetY = 0;
    this.fill = "rgba(0, 0, 0)";
    this.stroke = "rgba(255, 255, 255)";
    this.initDraw();
  }

  private async initDraw() {
    const ctx = this.canvas.getContext("2d");

    try {
      this.existingShapes = await this.getExistingShapes(this.roomId);
    } catch (e) {
      console.log(e);
    }

    if (!ctx) {
      return;
    }

    this.socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.shape) {
          if (message.shape === "clear") {
            this.existingShapes = [];
            this.clearCanvas(this.existingShapes, this.canvas, ctx);
          } else {
            this.existingShapes.push(message.shape);
            this.clearCanvas(this.existingShapes, this.canvas, ctx);
          }
        }
      } catch (e) {
        console.log(e);
      }
    };

    this.clearCanvas(this.existingShapes, this.canvas, ctx);

    this.canvas.addEventListener("mousedown", (e) => {
      console.log(this.selectedTool);
      this.clicked = true;
      this.startX = e.clientX;
      this.startY = e.clientY;
    });

    this.canvas.addEventListener("mouseup", (e) => {
      this.clicked = false;
      const width = e.clientX - this.startX;
      const height = e.clientY - this.startY;

      let shape: Shape | null = null;
      if (this.selectedTool === "rect") {
        shape = {
          type: "rect",
          x: this.startX - this.offsetX,
          y: this.startY - this.offsetY,
          height,
          width,
          fill: this.fill,
          stoke: this.stroke,
        };
      } else if (this.selectedTool === "circle") {
        const radius = Math.max(width, height) / 2;
        shape = {
          type: "circle",
          radius: radius,
          centerX: this.startX + radius - this.offsetX,
          centerY: this.startY + radius - this.offsetY,
          fill: this.fill,
          stoke: this.stroke,
        };
      } else if (this.selectedTool === "pencil") {
        shape = {
          type: "pencil",
          startX: this.startX - this.offsetX,
          startY: this.startY - this.offsetY,
          endX: e.clientX - this.offsetX,
          endY: e.clientY - this.offsetY,
          fill: this.fill,
          stoke: this.stroke,
        };
      }

      if (!shape) {
        return;
      }

      this.existingShapes.push(shape);

      this.socket.send(
        JSON.stringify({
          type: "messageRoom",
          message: JSON.stringify({
            shape,
          }),
          room: this.roomId,
        })
      );
    });

    this.canvas.addEventListener("mousemove", (e) => {
      if (this.clicked) {
        const ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
        const width = e.clientX - this.startX;
        const height = e.clientY - this.startY;
        this.clearCanvas(this.existingShapes, this.canvas, ctx);
        ctx.strokeStyle = this.stroke ?? "rgba(255, 255, 255)";
        ctx.fillStyle = this.fill ?? "rgba(0, 0, 0)";

        if (this.selectedTool === "rect") {
          ctx.fillRect(this.startX, this.startY, width, height);
          ctx.strokeRect(this.startX, this.startY, width, height);
        } else if (this.selectedTool === "circle") {
          const radius = Math.max(width, height) / 2;
          const centerX = this.startX + radius;
          const centerY = this.startY + radius;
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.closePath();
        } else if (this.selectedTool === "pencil") {
          ctx.beginPath();
          ctx.moveTo(this.startX, this.startY);
          ctx.lineTo(e.clientX, e.clientY);
          ctx.stroke();
        } else {
          this.offsetX += e.movementX;
          this.offsetY += e.movementY;
        }
      }
    });
  }

  public clearAll() {
    this.socket.send(
      JSON.stringify({
        type: "messageRoom",
        message: JSON.stringify({
          shape: "clear",
        }),
        room: this.roomId,
      })
    );
    this.existingShapes = [];
    this.clearCanvas(
      this.existingShapes,
      this.canvas,
      this.canvas.getContext("2d") as CanvasRenderingContext2D
    );
  }

  public setSelectedTool(tool: "none" | "rect" | "circle" | "pencil") {
    this.selectedTool = tool;
  }

  public setStrokeFill(stroke: string, fill: string) {
    this.stroke = stroke;
    this.fill = fill;
  }

  private clearCanvas(
    existingShapes: Shape[],
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D
  ) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(0, 0, 0)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.lineCap = "round";
    ctx.lineWidth = 5;

    existingShapes.map((shape) => {
      ctx.strokeStyle = shape.stoke;
      ctx.fillStyle = shape.fill;
      if (shape.type === "rect") {
        if (shape.fill)
          ctx.fillRect(
            shape.x + this.offsetX,
            shape.y + this.offsetY,
            shape.width,
            shape.height
          );
        ctx.strokeRect(
          shape.x + this.offsetX,
          shape.y + this.offsetY,
          shape.width,
          shape.height
        );
      } else if (shape.type === "circle") {
        ctx.beginPath();
        ctx.arc(
          shape.centerX + this.offsetX,
          shape.centerY + this.offsetY,
          shape.radius,
          0,
          Math.PI * 2
        );
        if (shape.fill) ctx.fill();
        ctx.stroke();
        ctx.closePath();
      } else if (shape.type === "pencil") {
        ctx.beginPath();
        ctx.moveTo(shape.startX + this.offsetX, shape.startY + this.offsetY);
        ctx.lineTo(shape.endX + this.offsetX, shape.endY + this.offsetY);
        ctx.stroke();
        ctx.closePath();
      }
    });
  }

  private async getExistingShapes(roomId: string) {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_HTTP_BACKEND}/chats/${roomId}`
      );
      const messages = res.data.chats;

      const shapes = messages.map((x: { message: string }) => {
        return JSON.parse(x.message).shape;
      });

      return shapes;
    } catch (error) {
      return [];
    }
  }
}

export { Canvas, type Shape };
