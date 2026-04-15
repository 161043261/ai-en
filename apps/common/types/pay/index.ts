export interface CreatePayDto {
  subject: string;
  totalAmount: string;
  courseId: string;
  body: string; // 附加信息
}

export interface ResultPay {
  payUrl: string;
  timeExpire: number;
}
