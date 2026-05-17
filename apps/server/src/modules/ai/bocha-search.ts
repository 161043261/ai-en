import { z } from "zod";
import { type Env, env } from "../../shared/config/env.js";
import { bochaSearchResponseSchema } from "./schema.js";

type BochaSearchEnv = Pick<
  Env,
  "BOCHA_API_KEY" | "BOCHA_ENABLED" | "BOCHA_SEARCH_URL"
>;

type FetchLike = (url: string, init: RequestInit) => Promise<Response>;

interface BochaSearchOptions {
  readonly config: BochaSearchEnv;
  readonly query: string;
  readonly count?: number;
  readonly fetchImpl?: FetchLike;
}

export class BochaSearchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BochaSearchError";
  }
}

const bochaConfigSchema = z.object({
  BOCHA_API_KEY: z.string().min(1),
  BOCHA_SEARCH_URL: z.url(),
});

export const shouldUseBochaSearch = (
  config: BochaSearchEnv,
  requested: boolean | undefined,
) => config.BOCHA_ENABLED && requested === true;

export const createBochaSearchForEnv = async ({
  config,
  query,
  count = 10,
  fetchImpl = fetch,
}: BochaSearchOptions) => {
  const bochaConfig = bochaConfigSchema.parse(config);
  const result = await fetchImpl(bochaConfig.BOCHA_SEARCH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${bochaConfig.BOCHA_API_KEY}`,
    },
    body: JSON.stringify({
      query,
      count,
      summary: true,
    }),
  });

  if (!result.ok) {
    throw new BochaSearchError("Bocha search request failed");
  }

  const payload: unknown = await result.json();
  const { data } = bochaSearchResponseSchema.parse(payload);
  const values = data?.webPages?.value ?? [];
  return values
    .map(
      (item) => `
       Title: ${item.name}
       URL: ${item.url}
       Summary: ${item.summary?.replace(/\s+/g, " ") ?? ""}
       Site name: ${item.siteName}
       Site icon: ${item.siteIcon}
       Crawled at: ${item.dateLastCrawled}
    `,
    )
    .join("\n");
};

export const createBochaSearch = (query: string, count = 10) =>
  createBochaSearchForEnv({ config: env, query, count });
