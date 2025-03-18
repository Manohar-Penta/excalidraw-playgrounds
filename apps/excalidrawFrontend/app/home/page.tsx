"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { LogOutIcon, PlusCircleIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast, ToastContainer } from "react-toastify";
import { useRouter } from "next/navigation";

export default function Page() {
  const [rooms, setRooms] = useState<
    {
      id: number;
      slug: string;
      userId: string;
      createdAt: Date;
    }[]
  >([]);

  const [roomName, setRoomName] = useState("");

  const router = useRouter();

  useEffect(() => {
    if (localStorage.getItem("token") === null) {
      router.push("/signin");
      return;
    }

    axios
      .get(`${process.env.NEXT_PUBLIC_HTTP_BACKEND}/rooms`, {
        headers: { Authorization: localStorage.getItem("token") },
      })
      .then((res) => {
        setRooms(res.data.pages);
      });
  }, []);

  return (
    <div className="flex flex-col">
      <div>
        <ul className="flex justify-between p-4 items-center">
          <li>
            <h1 className="text-2xl md:text-3xl font-bold">PlayGrounds</h1>
          </li>
          <li className="flex gap-1">
            <Dialog>
              <DialogTrigger asChild>
                <span className="flex gap-1 items-center border-2 rounded-md p-2 cursor-pointer">
                  <p>Create</p>
                  <PlusCircleIcon />
                </span>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle className="text-center">Create Room</DialogTitle>
                  <DialogDescription className="text-center">
                    Give a Unique name to your room
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="name"
                      className="col-span-3"
                      value={roomName}
                      onChange={(e) => {
                        setRoomName(e.target.value.trim());
                      }}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    onClick={async () => {
                      try {
                        if (!roomName) {
                          toast("Room name is required...");
                          return;
                        }
                        const res = await axios.post(
                          `${process.env.NEXT_PUBLIC_HTTP_BACKEND}/create-room`,
                          { roomName },
                          {
                            headers: {
                              Authorization: localStorage.getItem("token"),
                            },
                          }
                        );
                        router.push(`/${res.data.room.id}`);
                      } catch (e: any) {
                        // console.log(e);
                        toast(e);
                      }
                    }}
                  >
                    Create
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <span
              className="flex gap-1 items-center border-2 rounded-md p-2 cursor-pointer"
              onClick={() => {
                localStorage.removeItem("token");
                window.location.reload();
              }}
            >
              <LogOutIcon />
              <p>Logout</p>
            </span>
          </li>
        </ul>
      </div>
      <hr />
      <div className="flex flex-wrap items-center gap-2 p-4">
        {rooms.length > 0 &&
          rooms.map((room) => {
            return (
              <div key={room.id} className="border-2 rounded-md p-1 m-2">
                <a
                  href={`/${room.id}`}
                  className="text-center block text-xl md:text-2xl p-4 md:p-6 max-w-100px overflow-hidden text-ellipsis whitespace-nowrap"
                >
                  {room.slug}
                </a>
                <hr className="h-[2px] border border-gray-500 bg-gray-500" />
                <p className="text-xs text-right">created at:</p>
                <p className="text-xs text-right">
                  {new Date(room.createdAt).toDateString()}
                </p>
                <ToastContainer />
              </div>
            );
          })}
        {rooms.length == 0 && (
          <p className="p-4 text-center mx-auto text-xl h-[80vh] flex justify-center items-center">
            Use the <span className="border-2 p-2 rounded-md m-2">Create</span>{" "}
            button to create your first playground...
          </p>
        )}
      </div>
    </div>
  );
}
