import { TradeStatus } from "../../generated/prisma/client.js";

export const formatCourse = <Course extends { readonly price: unknown }>(
  course: Course,
) => ({
  ...course,
  price: Number(course.price).toFixed(2),
});

export const purchasedCourseWhere = (userId: string) => ({
  userId,
  paymentRecord: {
    tradeStatus: TradeStatus.TRADE_SUCCESS,
  },
});
