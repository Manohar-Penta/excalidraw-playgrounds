"use client";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";

export function Auth({ isSignIn }: { isSignIn: boolean }) {
  const [email, setEmail] = useState<string>("");
  const [password, setpassword] = useState<string>("");
  const router = useRouter();

  return (
    <div className="h-screen w-screen flex items-center justify-center">
      <div className="p-6 m-2 rounded-lg border-2 border-border md:p-8 shadow">
        <h1 className="text-xl sm:text-2xl font-bold text-center text-blue-500 underline">
          {isSignIn ? "Sign In to your Account" : "Sign up with Playgrounds"}
        </h1>
        <label className="my-2 md:my-4 block">
          <p className="">Email address</p>
          <input
            type="text"
            name="email"
            // placeholder="Email"
            className="border rounded p-2 w-full"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
          />
        </label>
        <label className="block my-2 md:my-4">
          <p className="">Password</p>
          <input
            type="password"
            // placeholder="Password"
            name="password"
            className="border rounded p-2 w-full"
            value={password}
            onChange={(e) => {
              setpassword(e.target.value);
            }}
          />
        </label>
        <button
          onClick={async () => {
            await toast.promise(
              async () => {
                try {
                  const res = await axios.post(
                    `${process.env.NEXT_PUBLIC_HTTP_BACKEND}/api/auth/${isSignIn ? "signin" : "signup"}`,
                    {
                      email,
                      password,
                    }
                  );
                  if (!res.data.token) throw "Invalid Credentials";
                  localStorage.setItem("token", res.data.token);
                  router.push("/home");
                } catch (error: any) {
                  const err =
                    error.response.data.msg ?? "Something went Wrong!!";
                  throw err;
                }
              },
              {
                pending: "Authenticating...",
                error: {
                  render({ data }: { data: string }) {
                    console.log(data);
                    return <p>{data}</p>;
                  },
                },
              }
            );
          }}
          className="text-background mx-auto border rounded p-1 px-2 block bg-blue-700 my-1 w-full"
        >
          {isSignIn ? "Sign In" : "Sign Up"}
        </button>
        {isSignIn ? (
          <p className="text-center">
            Don't have an account?{" "}
            <Link href="/signup" className="text-blue-500">
              Sign Up
            </Link>
          </p>
        ) : (
          <p className="text-center">
            Already have an account?{" "}
            <Link href="/signin" className="text-blue-500">
              Sign In
            </Link>
          </p>
        )}
      </div>
      <ToastContainer closeOnClick autoClose={2000} pauseOnHover />
    </div>
  );
}
