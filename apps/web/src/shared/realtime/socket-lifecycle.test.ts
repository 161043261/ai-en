import { describe, expect, test } from "vitest";
import { createSocketLifecycle } from "./socket-lifecycle";
import type { RealtimeSocket, SocketFactory } from "./socket-lifecycle";

describe("createSocketLifecycle", () => {
  test("connects once, disconnects, and removes listeners", () => {
    const events: string[] = [];
    const socket: RealtimeSocket = {
      disconnect: () => {
        events.push("disconnect");
      },
      off: (event) => {
        events.push(`off:${event}`);
      },
      on: (event) => {
        events.push(`on:${event}`);
      },
      removeAllListeners: () => {
        events.push("remove-listeners");
      },
    };
    const createSocket: SocketFactory = ({ userId }) => {
      events.push(`connect:${userId}`);
      return socket;
    };
    const lifecycle = createSocketLifecycle({
      createSocket,
      url: "http://localhost:3000",
    });

    lifecycle.connect("user-1");
    lifecycle.connect("user-1");
    lifecycle.disconnect();

    expect(events).toEqual([
      "connect:user-1",
      "disconnect",
      "remove-listeners",
    ]);
    expect(lifecycle.getSocket()).toBeNull();
    expect(lifecycle.getStatus()).toBe("disconnected");
  });

  test("stays unavailable without a socket adapter", () => {
    const lifecycle = createSocketLifecycle({ url: "http://localhost:3000" });

    lifecycle.connect("user-1");

    expect(lifecycle.getStatus()).toBe("unavailable");
    expect(lifecycle.getSocket()).toBeNull();
  });
});
