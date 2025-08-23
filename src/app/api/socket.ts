import { Server as NetServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import type { NextApiRequest } from "next";
import type { NextApiResponse } from "next";

type NextApiResponseWithSocket = NextApiResponse & {
  socket: NextApiResponse["socket"] & {
    server: NetServer & {
      io?: SocketIOServer;
    };
  };
};

export const config = {
  api: {
    bodyParser: false, // disable body parsing, needed for socket.io
  },
};

export default function handler(req: NextApiRequest, res: NextApiResponseWithSocket) {
  if (!res.socket.server.io) {
    console.log("🔌 Starting Socket.io server...");
    const io = new SocketIOServer(res.socket.server, {
      path: "/api/socket/io",
    });

    io.on("connection", (socket) => {
      console.log("✅ Socket connected:", socket.id);

      socket.on("roundChange", (round) => {
        io.emit("roundChange", round);
      });
    });

    res.socket.server.io = io;
  }

  res.end();
}
