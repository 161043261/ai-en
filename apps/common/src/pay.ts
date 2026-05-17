export interface CreatePayDto {
  subject: string;
  body: string;
  total_amount: string;
  courseId: string;
}

export interface ResultPay {
  payUrl: string;
  timeExpire: number;
}
