import { type Plugin } from "vite";
import { Buffer } from "node:buffer";
import { join } from "node:path";
import { createWriteStream, existsSync, mkdirSync, WriteStream } from "node:fs";
import pino from "pino";
import { z } from "zod";

const SentryLogPayloadSchema = z.json();

function createSentryLogger(logFile: string, fileStream: WriteStream) {
  const loggerOptions: pino.LoggerOptions = {
    formatters: {
      level: (label: string) => ({ level: label }),
    },
    level: "info",
    timestamp: pino.stdTimeFunctions.isoTime,
  };
  const stream = pino.multistream([
    { stream: process.stdout },
    { stream: fileStream },
  ]);

  const logger = pino(loggerOptions, stream);
  logger.info(
    `Sentry mock plugin initialized. Logs will be written to ${logFile}`,
  );
  return logger;
}

function appendChunk(body: string, chunk: unknown): string {
  if (typeof chunk === "string") {
    return body + chunk;
  }

  if (Buffer.isBuffer(chunk)) {
    return body + chunk.toString("utf8");
  }

  if (chunk instanceof Uint8Array) {
    return body + Buffer.from(chunk).toString("utf8");
  }

  return body;
}

function parseSentryPayload(body: string): unknown {
  const parsedBody: unknown = JSON.parse(body);
  return SentryLogPayloadSchema.parse(parsedBody);
}

export default function sentryPlugin(): Plugin {
  let fileStream: WriteStream;

  return {
    name: "vite-plugin-sentry",
    configureServer(server) {
      const logsDir = join(process.cwd(), "logs");
      if (!existsSync(logsDir)) {
        mkdirSync(logsDir, { recursive: true });
      }

      const timestamp = new Date()
        .toISOString()
        .replace(/[-:.]/g, "")
        .slice(0, 14);
      const logFile = join(logsDir, `sdk_${timestamp}.log`);

      fileStream = createWriteStream(logFile, { flags: "a" });

      createSentryLogger(logFile, fileStream);

      server.middlewares.use((req, res, next) => {
        if (req.url === "/sentry" && req.method === "POST") {
          let body = "";
          req.on("data", (chunk: unknown) => {
            body = appendChunk(body, chunk);
          });
          req.on("end", () => {
            if (body) {
              try {
                const parsedBody = parseSentryPayload(body);
                fileStream.write(JSON.stringify(parsedBody) + "\n");
              } catch {
                fileStream.write(body + "\n");
              }
            }
            res.setHeader("Content-Type", "application/json");
            res.statusCode = 200;
            res.end(JSON.stringify({ code: 0, message: "success" }));
          });
        } else {
          next();
        }
      });
    },
    closeBundle() {
      if (fileStream) {
        fileStream.close();
      }
    },
  };
}
