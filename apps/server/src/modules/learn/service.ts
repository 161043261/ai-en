import type { PrismaClient } from "../../generated/prisma/client.js";

interface WordBookRecordInput {
  readonly wordId: string;
  readonly userId: string;
  readonly isMaster: true;
}

export interface LearnTransactionClient {
  readonly wordBookRecord: {
    createMany(input: {
      readonly data: WordBookRecordInput[];
      readonly skipDuplicates: true;
    }): Promise<{ readonly count: number }>;
  };
  readonly user: {
    update(input: {
      readonly where: { readonly id: string };
      readonly data: {
        readonly wordNumber: { readonly increment: number };
      };
      readonly select: { readonly wordNumber: true };
    }): Promise<{ readonly wordNumber: number }>;
  };
}

export const buildWordBookRecords = (
  userId: string,
  wordIds: readonly string[],
): WordBookRecordInput[] =>
  wordIds.map((wordId) => ({
    wordId,
    userId,
    isMaster: true,
  }));

export const saveMasteredWordsInTransaction = async (
  tx: LearnTransactionClient,
  userId: string,
  wordIds: readonly string[],
) => {
  const records = buildWordBookRecords(userId, wordIds);
  const createResult = await tx.wordBookRecord.createMany({
    data: records,
    skipDuplicates: true,
  });
  const user = await tx.user.update({
    where: { id: userId },
    data: {
      wordNumber: {
        increment: createResult.count,
      },
    },
    select: { wordNumber: true },
  });

  return {
    savedCount: createResult.count,
    wordNumber: user.wordNumber,
  };
};

export const saveMasteredWords = (
  prisma: PrismaClient,
  userId: string,
  wordIds: readonly string[],
) =>
  prisma.$transaction((tx) => {
    const learnTx: LearnTransactionClient = {
      wordBookRecord: {
        createMany: (input) => tx.wordBookRecord.createMany(input),
      },
      user: {
        update: (input) => tx.user.update(input),
      },
    };

    return saveMasteredWordsInTransaction(learnTx, userId, wordIds);
  });
