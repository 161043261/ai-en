import "dotenv/config";
import { dirname, join } from "node:path";
import { performance } from "node:perf_hooks";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import { disconnectPrisma, prisma } from "../src/shared/prisma/index.js";
import { readLargeCsv } from "../src/shared/utils/ecdict.js";

const currentDir = dirname(fileURLToPath(import.meta.url));
const defaultCsvPath = join(currentDir, "../../../ecdict.csv");

const importArgsSchema = z.object({
  filePath: z.string().min(1),
  workerCount: z.coerce.number().int().positive().optional(),
});

function formatDuration(milliseconds: number): string {
  return `${(milliseconds / 1000).toFixed(2)}s`;
}

async function truncateWordBook(): Promise<void> {
  await prisma.$executeRaw`TRUNCATE TABLE "WordBook" CASCADE`;
}

const main = async () => {
  const args = importArgsSchema.parse({
    filePath: process.argv[2] ?? defaultCsvPath,
    workerCount: process.argv[3],
  });

  await truncateWordBook();

  const startedAt = performance.now();
  const result = await readLargeCsv(
    args.filePath,
    args.workerCount ? { workerCount: args.workerCount } : {},
  );
  const importDuration = performance.now() - startedAt;

  console.log(
    `Imported ${result.insertedRows.toLocaleString()} records from ${result.processedRows.toLocaleString()} rows in ${formatDuration(importDuration)} with ${result.workerCount.toLocaleString()} workers.`,
  );
};

try {
  await main();
} finally {
  await disconnectPrisma();
}
