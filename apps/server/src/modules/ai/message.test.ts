import { describe, expect, test } from "vitest";
import { parseAgentStreamChunk, toHistoryItem } from "./message.js";

describe("AI message parsing", () => {
  test("narrows streamed agent chunks", () => {
    expect(
      parseAgentStreamChunk([
        {
          content: "hello",
          type: "ai",
          additional_kwargs: { reasoning_content: "thinking" },
        },
      ]),
    ).toEqual({
      content: "hello",
      type: "ai",
      additional_kwargs: { reasoning_content: "thinking" },
    });
  });

  test("rejects unknown history messages", () => {
    expect(toHistoryItem({ content: 1 })).toBeNull();
  });
});
