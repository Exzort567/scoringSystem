import NextAuth from "next-auth";
import type { NextApiResponse } from "next";
import type { Socket } from "net";

export type NextApiResponseWithSocket = NextApiResponse & {
  socket: Socket & {
    server: any & { io?: any };
  };
};


declare module "next-auth" {
  interface Session {
    user: {
      id: string; // 👈 add id here
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}
