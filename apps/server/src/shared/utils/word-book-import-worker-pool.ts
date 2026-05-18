import { availableParallelism } from "node:os";
import { Worker } from "node:worker_threads";
import { createPool, type Pool } from "generic-pool";
import type { WordBookImportRow } from "./ecdict-row.js";
import {
  type WorkerRequest,
  type WorkerResponse,
  WorkerResponseSchema,
} from "./word-book-import-worker-protocol.js";

interface PendingRequest {
  readonly reject: (reason: Error) => void;
  readonly resolve: (count: number) => void;
}

export interface WordBookImportPoolOptions {
  readonly workerCount?: number;
}

export function getDefaultWordBookImportWorkerCount(): number {
  return Math.max(1, Math.min(4, availableParallelism() - 1));
}

export class WordBookImportWorker {
  private readonly pendingRequests = new Map<number, PendingRequest>();
  private readonly worker: Worker;
  private nextRequestId = 1;

  constructor() {
    this.worker = new Worker(
      new URL("./word-book-import-worker.ts", import.meta.url),
      { execArgv: ["--import", "tsx"] },
    );
    this.worker.on("message", (message: unknown) => {
      this.handleMessage(message);
    });
    this.worker.on("error", (error: Error) => {
      this.rejectPending(error);
    });
    this.worker.on("exit", (code) => {
      if (code !== 0) {
        this.rejectPending(
          new Error(`Import worker exited with code ${code}.`),
        );
      }
    });
  }

  importBatch(rows: readonly WordBookImportRow[]): Promise<number> {
    return this.send({
      id: this.nextRequestId,
      rows: [...rows],
      type: "import",
    });
  }

  async close(): Promise<void> {
    await this.send({ id: this.nextRequestId, type: "close" });
    await this.worker.terminate();
  }

  private send(request: WorkerRequest): Promise<number> {
    this.nextRequestId += 1;
    return new Promise<number>((resolve, reject) => {
      this.pendingRequests.set(request.id, { reject, resolve });
      this.worker.postMessage(request);
    });
  }

  private handleMessage(message: unknown): void {
    const response = WorkerResponseSchema.parse(message);
    const pending = this.pendingRequests.get(response.id);

    if (!pending) {
      return;
    }

    this.pendingRequests.delete(response.id);
    this.resolveResponse(pending, response);
  }

  private rejectPending(error: Error): void {
    for (const pending of this.pendingRequests.values()) {
      pending.reject(error);
    }
    this.pendingRequests.clear();
  }

  private resolveResponse(
    pending: PendingRequest,
    response: WorkerResponse,
  ): void {
    if (response.ok) {
      pending.resolve(response.count);
      return;
    }

    pending.reject(new Error(response.error));
  }
}

export function createWordBookImportPool(
  options: WordBookImportPoolOptions = {},
): Pool<WordBookImportWorker> {
  const workerCount =
    options.workerCount ?? getDefaultWordBookImportWorkerCount();

  return createPool<WordBookImportWorker>(
    {
      create: async () => new WordBookImportWorker(),
      destroy: async (worker) => {
        await worker.close();
      },
    },
    { max: workerCount, min: workerCount },
  );
}
