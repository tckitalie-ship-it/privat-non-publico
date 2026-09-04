import { io, Socket } from "socket.io-client";

import { getAccessToken } from "./api";

const SOCKET_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3001"
    : process.env.NEXT_PUBLIC_API_URL?.replace(
        /\/api\/?$/,
        "",
      ) ??
      "https://privat-non-publico.onrender.com";

let socket: Socket | null = null;

export function getSocket() {
  if (!socket) {
    const token = getAccessToken();

    socket = io(SOCKET_URL, {
      transports: ["websocket"],
      auth: {
        token,
      },
      autoConnect: true,
    });
  }

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
