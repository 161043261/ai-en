import { createAppServices } from "../../app/app-services";
import type { AppServices } from "../../app/app-services";
import type { AppConfig } from "../../shared/config";
import {
  createSocketLifecycle,
  type RealtimeSocket,
} from "../../shared/realtime";

export const paymentTestConfig: AppConfig = {
  aiApiBaseUrl: "/ai/v1",
  dataProvider: "swr",
  requestTimeoutMs: 50_000,
  routerProvider: "react-router",
  serverApiBaseUrl: "/api/v1",
  socketBaseUrl: "http://localhost:3000",
  storeProvider: "zustand",
};

export const paymentTestCourse = {
  description: "Build core vocabulary.",
  id: "course-1",
  name: "Starter Vocabulary",
  price: "19.9",
  teacher: "AI Coach",
  url: "/uploads/course.png",
  value: "starter",
};

export function createPaymentResult(
  overrides: { readonly timeExpire?: number } = {},
) {
  return {
    checkout: { provider: "external", managedBy: "upstream" },
    outTradeNo: "order-1",
    statusUrl: "/api/v1/pay/status/order-1",
    timeExpire: overrides.timeExpire ?? Date.now() + 60_000,
  };
}

export function paymentSuccessResponse(data: unknown): Response {
  return new Response(
    JSON.stringify({
      code: 200,
      data,
      message: "ok",
      path: "/pay/create",
      success: true,
      timestamp: "2026-05-17T00:00:00.000Z",
    }),
    { headers: { "Content-Type": "application/json" }, status: 200 },
  );
}

export function createPaymentServices(socket?: RealtimeSocket): AppServices {
  const services = createAppServices({
    config: paymentTestConfig,
    navigateHome: () => undefined,
  });
  if (!socket) return services;
  const socketLifecycle = createSocketLifecycle({
    createSocket: () => socket,
    url: paymentTestConfig.socketBaseUrl,
  });
  socketLifecycle.connect("user-1");
  return { ...services, socketLifecycle };
}
