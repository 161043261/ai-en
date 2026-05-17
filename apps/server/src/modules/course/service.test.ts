import { describe, expect, test } from "vitest";
import { TradeStatus } from "../../generated/prisma/client.js";
import { formatCourse, purchasedCourseWhere } from "./service.js";

describe("course service", () => {
  test("formats course price for API responses", () => {
    expect(formatCourse({ id: "course-1", price: "19.9" })).toEqual({
      id: "course-1",
      price: "19.90",
    });
  });

  test("builds purchased course filter", () => {
    expect(purchasedCourseWhere("user-1")).toEqual({
      userId: "user-1",
      paymentRecord: {
        tradeStatus: TradeStatus.TRADE_SUCCESS,
      },
    });
  });
});
