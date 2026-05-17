import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { AppServicesProvider } from "../../app/app-services-context";
import {
  createPaymentResult,
  createPaymentServices,
  paymentSuccessResponse,
  paymentTestCourse,
} from "./payment-dialog-test-helpers";
import { PaymentDialog } from "./payment-dialog";

describe("PaymentDialog", () => {
  afterEach(() => {
    cleanup();
    localStorage.clear();
    vi.unstubAllGlobals();
  });

  test("creates payment orders with the server contract", async () => {
    let requestBody = "";
    const fetchMock: typeof fetch = async (_input, init) => {
      requestBody = String(init?.body ?? "");
      return paymentSuccessResponse({
        ...createPaymentResult(),
        payUrl: "https://pay.example/order-1",
      });
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
          onSuccess={vi.fn()}
        />
      </AppServicesProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Create order" }));

    await waitFor(() => {
      expect(requestBody).toContain('"totalAmount":19.9');
    });
    expect(requestBody).toContain('"courseId":"course-1"');
  });

  test("shows an error when order creation fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(null, { status: 500 })),
    );

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
      await screen.findByText(
        "Unable to create payment order. Please try again.",
      ),
    ).toBeInTheDocument();
  });
});
