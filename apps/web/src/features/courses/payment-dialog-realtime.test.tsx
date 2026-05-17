import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { AppServicesProvider } from "../../app/app-services-context";
import type { RealtimeSocket } from "../../shared/realtime";
import { PaymentDialog } from "./payment-dialog";
import {
  createPaymentResult,
  createPaymentServices,
  paymentSuccessResponse,
  paymentTestCourse,
} from "./payment-dialog-test-helpers";

describe("PaymentDialog realtime confirmation", () => {
  afterEach(() => {
    cleanup();
    localStorage.clear();
    vi.unstubAllGlobals();
  });

  test("cleans up paymentSuccess listeners when the dialog unmounts", async () => {
    const fetchMock: typeof fetch = async (input) => {
      const url = String(input);
      if (url.includes("/pay/status/order-1")) {
        return paymentSuccessResponse({
          outTradeNo: "order-1",
          sendPayTime: "2026-05-17T00:00:00.000Z",
          tradeStatus: "NOT_PAY",
        });
      }
      return paymentSuccessResponse(createPaymentResult());
    };
    const listeners = new Map<string, () => void>();
    const socket: RealtimeSocket = {
      disconnect: vi.fn(),
      off: (event, listener) => {
        if (!listener || listeners.get(event) === listener)
          listeners.delete(event);
      },
      on: (event, listener) => {
        listeners.set(event, listener);
      },
      removeAllListeners: vi.fn(),
    };
    const services = createPaymentServices(socket);
    const onSuccess = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const view = render(
      <AppServicesProvider services={services}>
        <PaymentDialog
          close={vi.fn()}
          course={paymentTestCourse}
          isOpen={true}
          onSuccess={onSuccess}
        />
      </AppServicesProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Create order" }));

    await waitFor(() => {
      expect(listeners.get("paymentSuccess")).toBeDefined();
    });
    const listener = listeners.get("paymentSuccess");
    if (listener) listener();

    expect(
      await screen.findByText("Payment completed. Your courses are refreshed."),
    ).toBeInTheDocument();
    expect(onSuccess).toHaveBeenCalled();

    view.unmount();

    expect(listeners.has("paymentSuccess")).toBe(false);
  });

  test("refreshes owned courses when status polling succeeds", async () => {
    const onSuccess = vi.fn();
    const fetchMock: typeof fetch = async (input) => {
      const url = String(input);
      if (url.includes("/pay/status/order-1")) {
        return paymentSuccessResponse({
          outTradeNo: "order-1",
          sendPayTime: "2026-05-17T00:00:00.000Z",
          tradeStatus: "TRADE_SUCCESS",
        });
      }
      return paymentSuccessResponse(createPaymentResult());
    };
    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal("open", vi.fn());
    const services = createPaymentServices();

    render(
      <AppServicesProvider services={services}>
        <PaymentDialog
          close={vi.fn()}
          course={paymentTestCourse}
          isOpen={true}
          onSuccess={onSuccess}
        />
      </AppServicesProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Create order" }));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
    expect(
      await screen.findByText("Payment completed. Your courses are refreshed."),
    ).toBeInTheDocument();
  });

  test("expires payment orders when polling passes the deadline", async () => {
    const fetchMock: typeof fetch = async () =>
      paymentSuccessResponse(
        createPaymentResult({ timeExpire: Date.now() - 1 }),
      );
    vi.stubGlobal("fetch", fetchMock);
    const services = createPaymentServices();

    render(
      <AppServicesProvider services={services}>
        <PaymentDialog
          close={vi.fn()}
          course={paymentTestCourse}
          isOpen={true}
          onSuccess={vi.fn()}
        />
      </AppServicesProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Create order" }));

    expect(
      await screen.findByText("Payment expired. Please create a new order."),
    ).toBeInTheDocument();
  });
});
