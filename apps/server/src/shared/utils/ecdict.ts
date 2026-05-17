import { createReadStream } from "node:fs";
import { createInterface } from "node:readline";
import iconv from "iconv-lite";
import {
  createWordBookImportRow,
  type WordBookImportRow,
} from "./ecdict-row.js";
import { validateWordBookCsvHeaders } from "./word-book-csv-schema.js";
import {
  createWordBookImportPool,
  getDefaultWordBookImportWorkerCount,
} from "./word-book-import-worker-pool.js";

const batchSize = 2000;

export interface ReadLargeCsvOptions {
  readonly workerCount?: number;
}

export interface ReadLargeCsvResult {
  readonly insertedRows: number;
  readonly processedRows: number;
  readonly workerCount: number;
}

export async function readLargeCsv(
  filepath: string,
  options: ReadLargeCsvOptions = {},
): Promise<ReadLargeCsvResult> {
  const workerCount =
    options.workerCount ?? getDefaultWordBookImportWorkerCount();
  const maxInFlightBatches = workerCount * 2;
  const workerPool = createWordBookImportPool({ workerCount });
  const pendingBatches = new Set<Promise<void>>();
  let lineCount = 0;
  let headers: string[] = [];
  let batch: WordBookImportRow[] = [];
  let totalInserted = 0;

  async function scheduleBatch(rows: readonly WordBookImportRow[]) {
    const task = workerPool
      .use(async (worker) => {
        totalInserted += await worker.importBatch(rows);
      })
      .finally(() => {
        pendingBatches.delete(task);
      });
    pendingBatches.add(task);

    if (pendingBatches.size >= maxInFlightBatches) {
      await Promise.race(pendingBatches);
    }
  }

  try {
    const fileStream = createReadStream(filepath).pipe(
      iconv.decodeStream("utf-8"),
    );
    const rl = createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });
    for await (const line of rl) {
      lineCount++;
      if (lineCount === 1) {
        headers = line.split(",");
        const validation = validateWordBookCsvHeaders(headers);
        if (!validation.valid) {
          throw new Error(
            `Missing required CSV headers: ${validation.missing.join(", ")}`,
          );
        }
        continue;
      }
      batch.push(createWordBookImportRow(headers, line));
      if (batch.length >= batchSize) {
        await scheduleBatch(batch);
        batch = [];
      }
    }
    if (batch.length > 0) {
      await scheduleBatch(batch);
    }
    await Promise.all(pendingBatches);
    console.log(
      `Processed ${(lineCount - 1).toLocaleString()} lines. Inserted ${totalInserted.toLocaleString()} records with ${workerCount.toLocaleString()} workers.`,
    );
    return {
      insertedRows: totalInserted,
      processedRows: lineCount - 1,
      workerCount,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("Error:", errorMessage);
    throw new Error(`Failed to read large CSV file: ${errorMessage}`);
  } finally {
    await workerPool.drain();
    await workerPool.clear();
  }
}
