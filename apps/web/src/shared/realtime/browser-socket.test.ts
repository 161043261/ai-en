import { io } from "socket.io-client";
import { afterEach, describe, expect, test, vi } from "vitest";
import { createBrowserSocket } from "./browser-socket";

const socketMock = vi.hoisted(() => ({
  disconnect: vi.fn(),
  off: vi.fn(),
  on: vi.fn(),
  removeAllListeners: vi.fn(),
}));

vi.mock("socket.io-client", () => ({
  io: vi.fn(() => socketMock),
}));

describe("createBrowserSocket", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test("connects with the legacy websocket options", () => {
    createBrowserSocket({
      url: "http://localhost:3000",
      userId: "user-1",
    });

    expect(vi.mocked(io)).toHaveBeenCalledWith("http://localhost:3000", {
      autoConnect: true,
      query: { userId: "user-1" },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20_000,
      transports: ["websocket"],
    });
  });

  test("adapts socket listener operations", () => {
    const listener = vi.fn();
    const socket = createBrowserSocket({
      url: "http://localhost:3000",
      userId: "user-1",
    });

    socket.on("paymentSuccess", listener);
    socket.off("paymentSuccess", listener);
    socket.disconnect();
    socket.removeAllListeners();

    expect(socketMock.on).toHaveBeenCalledWith("paymentSuccess", listener);
    expect(socketMock.off).toHaveBeenCalledWith("paymentSuccess", listener);
    expect(socketMock.disconnect).toHaveBeenCalled();
    expect(socketMock.removeAllListeners).toHaveBeenCalled();
  });
});
