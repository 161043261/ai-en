import nodemailer from "nodemailer";
import { env } from "../config/env.js";

export interface EmailMessage {
  readonly to: string;
  readonly subject: string;
  readonly html: string;
}

export interface EmailTransport {
  sendMail(message: {
    readonly from: string;
    readonly to: string;
    readonly subject: string;
    readonly html: string;
  }): Promise<unknown>;
}

export interface SendEmailOptions {
  readonly enabled?: boolean;
}

export const createEmailTransport = (): EmailTransport =>
  nodemailer.createTransport({
    host: env.EMAIL_HOST,
    port: env.EMAIL_PORT,
    secure: env.EMAIL_USE_SSL,
    auth: {
      user: env.EMAIL_USER,
      pass: env.EMAIL_PASSWORD,
    },
  });

export const sendEmail = async (
  transport: EmailTransport,
  message: EmailMessage,
  options: SendEmailOptions = {},
) => {
  if (!(options.enabled ?? env.EMAIL_ENABLED)) {
    return false;
  }

  try {
    await transport.sendMail({
      from: env.EMAIL_FROM || env.EMAIL_USER,
      to: message.to,
      subject: message.subject,
      html: message.html,
    });
    return true;
  } catch {
    return false;
  }
};
