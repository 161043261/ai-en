import "dotenv/config";
import { z } from "zod";
import { disconnectPrisma } from "../src/shared/prisma/index.js";
import { readLargeCsv } from "../src/shared/utils/ecdict.js";

const importArgsSchema = z.object({
  filePath: z.string().min(1),
});

const main = async () => {
  const args = importArgsSchema.parse({
    filePath: process.argv[2],
  });

  await readLargeCsv(args.filePath);
};

try {
  await main();
} finally {
  await disconnectPrisma();
}
