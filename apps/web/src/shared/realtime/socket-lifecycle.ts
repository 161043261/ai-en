export type RealtimeSocket = {
  readonly disconnect: () => void;
  readonly off: (event: string, listener?: () => void) => void;
  readonly on: (event: string, listener: () => void) => void;
  readonly removeAllListeners: () => void;
};

export type SocketFactoryOptions = {
  readonly url: string;
  readonly userId: string;
};

export type SocketFactory = (options: SocketFactoryOptions) => RealtimeSocket;

export type SocketLifecycle = {
  readonly connect: (userId: string | undefined) => void;
  readonly disconnect: () => void;
  readonly getSocket: () => RealtimeSocket | null;
  readonly getStatus: () => SocketStatus;
  readonly subscribe: (listener: () => void) => () => void;
};

export type SocketLifecycleOptions = {
  readonly createSocket?: SocketFactory;
  readonly url: string;
};

export type SocketStatus = "connected" | "disconnected" | "unavailable";

export function createSocketLifecycle(
  options: SocketLifecycleOptions,
): SocketLifecycle {
  const listeners = new Set<() => void>();
  let socket: RealtimeSocket | null = null;
  let status: SocketStatus = options.createSocket
    ? "disconnected"
    : "unavailable";

  const notify = () => {
    listeners.forEach((listener) => listener());
  };

  return {
    connect: (userId) => {
      if (!userId || socket || !options.createSocket) return;
      socket = options.createSocket({ url: options.url, userId });
      status = "connected";
      notify();
    },
    disconnect: () => {
      if (!socket) return;
      socket.disconnect();
      socket.removeAllListeners();
      socket = null;
      status = options.createSocket ? "disconnected" : "unavailable";
      notify();
    },
    getSocket: () => socket,
    getStatus: () => status,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
