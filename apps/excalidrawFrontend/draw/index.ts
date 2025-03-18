import axios from "axios";

type Shape =
  | {
      type: "rect";
      x: number;
      y: number;
      width: number;
      height: number;
      stroke: string;
      fill: string | null;
    }
  | {
      type: "circle";
      centerX: number;
      centerY: number;
      radius: number;
      stroke: string;
      fill: string | null;
    }
  | {
      type: "pencil";
      startX: number;
      startY: number;
      endX: number;
      endY: number;
      stroke: string;
      fill: string | null;
    }
  | {
      type: "text";
      startX: number;
      startY: number;
      text: string;
      stroke: string;
      fill: string | null;
    };

class Canvas {
  public canvas: HTMLCanvasElement;
  private roomId: string;
  private socket: WebSocket;
  private clicked: boolean;
  private startX: number;
  private startY: number;
  public existingShapes: Shape[];
  private selectedTool: "none" | "rect" | "circle" | "pencil" | "text";
  private offsetX: number;
  private offsetY: number;
  private fill: string | null;
  private stroke: string;
  private scale: number = 1;

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
    this.fill = null;
    this.stroke = "rgba(255, 255, 255)";
    this.initDraw();
  }

  private async initDraw() {
    const ctx = this.canvas.getContext("2d");

    if (!ctx) {
      return;
    }

    try {
      this.existingShapes = await this.getExistingShapes(this.roomId);
      console.log(this.existingShapes);
    } catch (e) {
      console.log(e);
    }

    this.clearCanvas();

    this.socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.shape) {
          if (message.shape === "clear") {
            this.existingShapes = [];
            this.clearCanvas();
          } else {
            this.existingShapes.push(message.shape);
            this.clearCanvas();
          }
        }
      } catch (e) {
        console.log(e);
      }
    };

    this.canvas.addEventListener("mousedown", (e) => {
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
          x: this.startX / this.scale - this.offsetX,
          y: this.startY / this.scale - this.offsetY,
          height: height / this.scale,
          width: width / this.scale,
          fill: this.fill,
          stroke: this.stroke,
        };
      } else if (this.selectedTool === "circle") {
        const radius = Math.max(Math.abs(width), Math.abs(height)) / 2;
        shape = {
          type: "circle",
          radius: radius / this.scale,
          centerX: (this.startX + e.clientX) / (2 * this.scale) - this.offsetX,
          centerY: (this.startY + e.clientY) / (2 * this.scale) - this.offsetY,
          fill: this.fill,
          stroke: this.stroke,
        };
      } else if (this.selectedTool === "pencil") {
        shape = {
          type: "pencil",
          startX: this.startX / this.scale - this.offsetX,
          startY: this.startY / this.scale - this.offsetY,
          endX: e.clientX / this.scale - this.offsetX,
          endY: e.clientY / this.scale - this.offsetY,
          fill: this.fill,
          stroke: this.stroke,
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

    this.canvas.addEventListener("wheel", (e) => {
      e.preventDefault();
      this.scale -= e.deltaY / 5000;
      if (this.scale > 10) this.scale = 10;
      if (this.scale < 0.1) this.scale = 0.1;
      this.clearCanvas();
    });

    this.canvas.addEventListener("mousemove", (e) => {
      if (this.clicked) {
        const ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
        const width = e.clientX - this.startX;
        const height = e.clientY - this.startY;
        this.clearCanvas();
        ctx.strokeStyle = this.stroke ?? "rgba(255, 255, 255)";
        if (this.fill) ctx.fillStyle = this.fill;

        if (this.selectedTool === "rect") {
          if (this.fill) ctx.fillRect(this.startX, this.startY, width, height);
          ctx.strokeRect(this.startX, this.startY, width, height);
        } else if (this.selectedTool === "circle") {
          const radius = Math.max(Math.abs(width), Math.abs(height)) / 2;
          const centerX = (this.startX + e.clientX) / 2;
          const centerY = (this.startY + e.clientY) / 2;
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
          if (this.fill) ctx.fill();
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
          this.clearCanvas();
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
    this.clearCanvas();
  }

  public clearCanvas() {
    const existingShapes = this.existingShapes;
    const canvas = this.canvas;
    const ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(0, 0, 0)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.lineCap = "round";
    ctx.lineWidth = 5;

    existingShapes.map((shape) => {
      ctx.strokeStyle = shape.stroke;
      if (shape.fill) {
        ctx.fillStyle = shape.fill;
      }
      if (shape.type === "rect") {
        if (shape.fill) {
          ctx.fillRect(
            (shape.x + this.offsetX) * this.scale,
            (shape.y + this.offsetY) * this.scale,
            shape.width * this.scale,
            shape.height * this.scale
          );
        }
        ctx.strokeRect(
          (shape.x + this.offsetX) * this.scale,
          (shape.y + this.offsetY) * this.scale,
          shape.width * this.scale,
          shape.height * this.scale
        );
      } else if (shape.type === "circle") {
        ctx.beginPath();
        ctx.arc(
          (shape.centerX + this.offsetX) * this.scale,
          (shape.centerY + this.offsetY) * this.scale,
          shape.radius * this.scale,
          0,
          Math.PI * 2
        );
        if (shape.fill) {
          ctx.fill();
        }
        ctx.stroke();
        ctx.closePath();
      } else if (shape.type === "pencil") {
        ctx.beginPath();
        ctx.moveTo(
          (shape.startX + this.offsetX) * this.scale,
          (shape.startY + this.offsetY) * this.scale
        );
        ctx.lineTo(
          (shape.endX + this.offsetX) * this.scale,
          (shape.endY + this.offsetY) * this.scale
        );
        ctx.stroke();
        ctx.closePath();
      } else if (shape.type === "text") {
        ctx.font = `italic ${this.scale * 30}px sans-serif`;
        if (shape.stroke) {
          ctx.fillStyle = shape.stroke;
        }
        ctx.fillText(
          shape.text,
          (shape.startX + this.offsetX) * this.scale,
          (shape.startY + this.offsetY) * this.scale
        );
      }
    });
    // console.log(ctx);
  }

  public addText(x: number, y: number, text: string) {
    const shape: Shape = {
      type: "text",
      startX: x / this.scale - this.offsetX,
      startY: y / this.scale - this.offsetY,
      text,
      stroke: this.stroke,
      fill: this.fill,
    };
    this.existingShapes.push(shape);

    this.socket.send(
      JSON.stringify({
        type: "messageRoom",
        message: JSON.stringify({ shape }),
        room: this.roomId,
      })
    );

    this.clearCanvas();
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

      // console.log(shapes);
      return shapes;
    } catch (error) {
      return [];
    }
  }

  public setSelectedTool(tool: "none" | "rect" | "circle" | "pencil" | "text") {
    this.selectedTool = tool;
  }

  public setStrokeFill(stroke: string, fill: string | null) {
    this.stroke = stroke;
    this.fill = fill;
  }
}

export { Canvas, type Shape };
