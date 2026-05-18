import "dotenv/config";
import { type MessagePort, parentPort } from "node:worker_threads";
import { disconnectPrisma, prisma } from "../shared/prisma/index.js";
import { WorkerRequestSchema } from "../shared/utils/word-book-import-worker-protocol.js";

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unknown worker error";
}

function getParentPort(): MessagePort {
  if (!parentPort) {
    throw new Error("Word book import worker must run inside a worker thread.");
  }

  return parentPort;
}

const workerPort = getParentPort();

workerPort.on("message", (message: unknown) => {
  void handleMessage(workerPort, message);
});

async function handleMessage(
  port: MessagePort,
  message: unknown,
): Promise<void> {
  const request = WorkerRequestSchema.parse(message);

  if (request.type === "close") {
    await disconnectPrisma();
    port.postMessage({ count: 0, id: request.id, ok: true });
    return;
  }

  try {
    const result = await prisma.wordBook.createMany({
      data: request.rows,
      skipDuplicates: true,
    });
    port.postMessage({ count: result.count, id: request.id, ok: true });
  } catch (error) {
    port.postMessage({
      error: getErrorMessage(error),
      id: request.id,
      ok: false,
    });
  }
}
