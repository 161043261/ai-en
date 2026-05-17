import { io } from "socket.io-client";
import type { RealtimeSocket, SocketFactoryOptions } from "./socket-lifecycle";

export function createBrowserSocket({
  url,
  userId,
}: SocketFactoryOptions): RealtimeSocket {
  const socket = io(url, {
    autoConnect: true,
    query: { userId },
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20_000,
    transports: ["websocket"],
  });

  return {
    disconnect: () => socket.disconnect(),
    off: (event, listener) => {
      if (listener) {
        socket.off(event, listener);
        return;
      }
      socket.off(event);
    },
    on: (event, listener) => socket.on(event, listener),
    removeAllListeners: () => {
      socket.removeAllListeners();
    },
  };
}
