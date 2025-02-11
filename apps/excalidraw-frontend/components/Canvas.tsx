"use client";

import { Canvas } from "@/draw/index";
import { useEffect, useRef, useState } from "react";
import {
  PointerIcon,
  RectangleHorizontal,
  Circle,
  PencilIcon,
  BanIcon,
  PaintBucketIcon,
  EraserIcon,
  TypeIcon,
} from "lucide-react";
import { ColorPicker } from "./ui/color-picker";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";

type Tool = "none" | "rect" | "circle" | "pencil" | "text";

export function CanvasComponent(props: { roomId: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [state, setState] = useState<Tool>("none");
  const [main, setMain] = useState<Canvas | null>(null);
  const [stroke, setStroke] = useState<string>("#ffffff");
  const [fill, setFill] = useState<string | null>(null);
  const [input, setInput] = useState<{
    visible: boolean;
    x: number;
    y: number;
    text: string;
  }>({ visible: false, x: 0, y: 0, text: "" });

  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) router.push("/signin");

    if (canvasRef.current == null) return;
    const socket = new WebSocket(
      `${process.env.NEXT_PUBLIC_WS_BACKEND}?token=${token}`
    );

    socket.onopen = () => {
      try {
        socket.send(
          JSON.stringify({
            type: "joinRoom",
            room: parseInt(props.roomId),
          })
        );
      } catch (e) {
        toast(e as string);
      }
    };

    const main = new Canvas(canvasRef.current, props.roomId, socket);
    setMain(main);

    () => {
      socket.close();
    };
  }, []);

  useEffect(() => {
    if (canvasRef.current == null) return;

    const textHandler = (e: MouseEvent) => {
      if (state != "text" || canvasRef.current === null) {
        return;
      }

      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      setInput({ visible: true, x, y, text: "" });
    };

    canvasRef.current.addEventListener("click", textHandler);

    return () => {
      canvasRef.current?.removeEventListener("click", textHandler);
    };
  }, [state]);

  useEffect(() => {
    main?.setSelectedTool(state);
  }, [state]);

  useEffect(() => {
    main?.setStrokeFill(stroke, fill);
  }, [stroke, fill]);

  return (
    <div className="overflow-hidden">
      <div className="fixed top-0 left-0 right-0 mx-auto w-fit my-2">
        <ul
          className={
            "flex gap-1 items-center border-2 rounded p-2 " + "bg-white"
          }
        >
          <li onClick={() => setState("none")}>
            <PointerIcon
              size={"1.5rem"}
              color={"black"}
              className={state == "none" ? "bg-gray-400 rounded p-[1px]" : ""}
            />
          </li>
          <li onClick={() => setState("rect")}>
            <RectangleHorizontal
              size={"1.5rem"}
              color={"black"}
              className={state == "rect" ? "bg-gray-400 rounded p-[1px]" : ""}
            />
          </li>
          <li onClick={() => setState("circle")}>
            <Circle
              size={"1.5rem"}
              color={"black"}
              className={state == "circle" ? "bg-gray-400 rounded p-[1px]" : ""}
            />
          </li>
          <li onClick={() => setState("pencil")}>
            <PencilIcon
              size={"1.5rem"}
              color={"black"}
              className={state == "pencil" ? "bg-gray-400 rounded p-[1px]" : ""}
            />
          </li>
          <li onClick={() => setState("text")}>
            <TypeIcon
              size={"1.5rem"}
              color={"black"}
              className={state == "text" ? "bg-gray-400 rounded p-[1px]" : ""}
              onClick={() => {
                setState("text");
              }}
            />
          </li>
          <li>
            <ColorPicker
              value={stroke}
              onChange={setStroke}
              className={`border-4 size-[1.5rem]`}
            />
          </li>
          <li>
            <ColorPicker
              onChange={setFill}
              value={fill ?? "white"}
              className={`border-4 size-[1.5rem]`}
            />
          </li>
          <li className="relative">
            <BanIcon
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-8 z-0"
              color="gray"
              onClick={() => {
                setFill(null);
              }}
            />
            <PaintBucketIcon
              className="size-[1.5rem] z-10"
              color="blue"
              onClick={() => {
                setFill(null);
              }}
            />
          </li>
          <li>
            <EraserIcon
              className="size-[1.5rem]"
              color="black"
              onClick={() => {
                main?.clearAll();
              }}
            />
          </li>
        </ul>
      </div>
      <canvas
        ref={canvasRef}
        width={window.innerWidth}
        height={window.innerHeight}
        color="black"
        className=""
      ></canvas>
      {state == "text" && input.visible && (
        <input
          type="text"
          placeholder="Enter text"
          value={input.text}
          onChange={(e) => {
            setInput({ ...input, text: e.target.value });
          }}
          className={`absolute border-2 text-white rounded-md bg-black focus:outline-none`}
          style={{ left: input.x, top: input.y }}
          autoFocus
          onKeyDown={(e) => {
            if (e.key != "Enter") return;
            main?.addText(input.x, input.y, input.text);
            setInput({ visible: false, x: 0, y: 0, text: "" });
            setState("none");
          }}
        />
      )}
      <ToastContainer />
    </div>
  );
}
