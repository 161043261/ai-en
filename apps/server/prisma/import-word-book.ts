import "dotenv/config";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import { disconnectPrisma } from "../src/shared/prisma/index.js";
import { readLargeCsv } from "../src/shared/utils/ecdict.js";

const currentDir = dirname(fileURLToPath(import.meta.url));
const defaultCsvPath = join(currentDir, "../../../ecdict.csv");

const importArgsSchema = z.object({
  filePath: z.string().min(1),
});

const main = async () => {
  const args = importArgsSchema.parse({
    filePath: process.argv[2] ?? defaultCsvPath,
  });

  await readLargeCsv(args.filePath);
};

try {
  await main();
} finally {
  await disconnectPrisma();
}
