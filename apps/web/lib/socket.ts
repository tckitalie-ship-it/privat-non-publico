import { io, Socket } from 'socket.io-client';

import { API_URL } from '@/lib/api';

let socket: Socket | null = null;

export function getSocket() {
  if (!socket) {
    socket = io(API_URL.replace('/api', ''), {
      transports: ['websocket'],
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