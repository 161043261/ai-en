import { describe, expect, test } from "vitest";
import {
  chatMode,
  chatPromptContract,
  getPromptByRole,
  listPromptMetadata,
  listPromptReviewItems,
} from "./prompts.js";
import { chatRoleSchema } from "./schema.js";

describe("AI prompts", () => {
  test("returns stable public prompt metadata", () => {
    expect(listPromptMetadata()).toEqual([
      { id: "1", label: "AI Assistant", role: "normal" },
      { id: "2", label: "English Master", role: "master" },
      { id: "3", label: "Business English", role: "business" },
      { id: "4", label: "Creative Mode", role: "lark" },
      { id: "5", label: "Programmer Mode", role: "hangtiancheng" },
    ]);
  });

  test("derives chat role validation from prompt configuration", () => {
    expect(chatRoleSchema.safeParse("master").success).toBe(true);
    expect(chatRoleSchema.safeParse("unknown").success).toBe(false);
    expect(getPromptByRole("master")?.label).toBe("English Master");
  });

  test("keeps legacy role ids unique and ordered", () => {
    expect(chatMode.map((item) => item.id)).toEqual(["1", "2", "3", "4", "5"]);
    expect(new Set(chatMode.map((item) => item.id)).size).toBe(chatMode.length);
    expect(new Set(chatMode.map((item) => item.role)).size).toBe(
      chatMode.length,
    );
  });

  test("declares prompt copy source and review status", () => {
    expect(chatPromptContract).toEqual({
      copyLocale: "en-US",
      copySource: "source",
      reviewStatus: "pending-product-review",
      version: "2026-05-18",
    });
    expect(listPromptReviewItems()).toEqual(
      chatMode.map((item) => ({
        id: item.id,
        role: item.role,
        label: item.label,
        copyLocale: "en-US",
        reviewStatus: "pending-product-review",
      })),
    );
  });
});
