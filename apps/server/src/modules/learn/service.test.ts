import { describe, expect, test } from "vitest";
import {
  buildWordBookRecords,
  type LearnTransactionClient,
  saveMasteredWordsInTransaction,
} from "./service.js";

describe("learn service", () => {
  test("builds mastered word records", () => {
    expect(buildWordBookRecords("user-1", ["word-1", "word-2"])).toEqual([
      { userId: "user-1", wordId: "word-1", isMaster: true },
      { userId: "user-1", wordId: "word-2", isMaster: true },
    ]);
  });

  test("increments learned count by inserted row count", async () => {
    const createManyInputs: unknown[] = [];
    const updateInputs: unknown[] = [];
    const tx: LearnTransactionClient = {
      wordBookRecord: {
        createMany: async (input) => {
          createManyInputs.push(input);
          return { count: 1 };
        },
      },
      user: {
        update: async (input) => {
          updateInputs.push(input);
          return { wordNumber: 8 };
        },
      },
    };

    const result = await saveMasteredWordsInTransaction(tx, "user-1", [
      "word-1",
      "word-2",
    ]);

    expect(result).toEqual({ savedCount: 1, wordNumber: 8 });
    expect(createManyInputs).toEqual([
      {
        data: [
          { userId: "user-1", wordId: "word-1", isMaster: true },
          { userId: "user-1", wordId: "word-2", isMaster: true },
        ],
        skipDuplicates: true,
      },
    ]);
    expect(updateInputs).toEqual([
      {
        where: { id: "user-1" },
        data: { wordNumber: { increment: 1 } },
        select: { wordNumber: true },
      },
    ]);
  });
});
