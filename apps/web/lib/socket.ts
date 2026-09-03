import { io, Socket } from "socket.io-client";

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
    socket = io(SOCKET_URL, {
      transports: ["websocket"],
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