import { describe, expect, test } from "vitest";
import { type EmailTransport, sendEmail } from "./sender.js";

describe("email sender", () => {
  test("returns true when transport sends mail", async () => {
    const messages: unknown[] = [];
    const transport: EmailTransport = {
      sendMail: async (message) => {
        messages.push(message);
        return {};
      },
    };

    await expect(
      sendEmail(
        transport,
        {
          to: "user@example.com",
          subject: "Subject",
          html: "<p>Hello</p>",
        },
        {
          enabled: true,
        },
      ),
    ).resolves.toBe(true);
    expect(messages).toHaveLength(1);
  });

  test("skips transport when email is disabled", async () => {
    const messages: unknown[] = [];
    const transport: EmailTransport = {
      sendMail: async (message) => {
        messages.push(message);
        return {};
      },
    };

    await expect(
      sendEmail(
        transport,
        {
          to: "user@example.com",
          subject: "Subject",
          html: "<p>Hello</p>",
        },
        {
          enabled: false,
        },
      ),
    ).resolves.toBe(false);
    expect(messages).toHaveLength(0);
  });

  test("returns false when transport fails", async () => {
    const transport: EmailTransport = {
      sendMail: async () => {
        throw new Error("SMTP failure");
      },
    };

    await expect(
      sendEmail(
        transport,
        {
          to: "user@example.com",
          subject: "Subject",
          html: "<p>Hello</p>",
        },
        {
          enabled: true,
        },
      ),
    ).resolves.toBe(false);
  });
});
