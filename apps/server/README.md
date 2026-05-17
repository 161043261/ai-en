# AI English Hono Server

Hono monolith for the migrated AI English backend. The service keeps Prisma,
PostgreSQL, Redis, MinIO, AI providers, and SMTP integrations behind validated
environment configuration. Alipay SDK support is optional and must stay behind
`ALIPAY_ENABLED=true`.

## Setup

```bash
pnpm install
cp .env.example .env
pnpm prisma:generate
pnpm db:migrate
pnpm db:seed
pnpm dev
```

Open `http://localhost:3000/health` for the basic health check.

## Commands

```bash
pnpm dev
pnpm build
pnpm start
pnpm test
pnpm lint:ci
pnpm prisma:validate
pnpm staging:smoke
pnpm run ci
```

Database commands:

```bash
pnpm db:migrate
pnpm db:deploy
pnpm db:seed
pnpm word-book:import /absolute/path/to/ecdict.csv
```

`pnpm db:seed` restores the legacy course catalog values and uploads the
matching course images to the `course` object-storage bucket.
`pnpm word-book:import` imports ECDICT-compatible CSV files after validating the
required headers.

## Readiness

- `GET /health` verifies that the Hono process can serve requests.
- `GET /ready` verifies PostgreSQL, Redis, MinIO, and provider-specific AI configuration.
- DeepSeek readiness requires `DEEPSEEK_API_KEY`.
- Ollama readiness requires `OLLAMA_MODEL`, `OLLAMA_REASONER_MODEL`, and a reachable `OLLAMA_BASE_URL`.
- Ollama readiness calls `/api/tags` and verifies that the configured chat and reasoning models are installed locally.
- When `BOCHA_ENABLED=true`, readiness also validates Bocha URL and API key configuration.
- A ready response returns HTTP `200` with `data.status` set to `ready`.
- An unavailable dependency returns HTTP `503` with dependency details.

## Staging Smoke

```bash
STAGING_BASE_URL=https://staging.example.com pnpm staging:smoke
```

- Automated checks call `/health` and `/ready` on the staging Hono server.
- The report lists required staging env keys for PostgreSQL, Redis, MinIO, provider-specific AI, SMTP when `EMAIL_ENABLED=true`, and Alipay when `ALIPAY_ENABLED=true`.
- The report also records manual checks for digest email, avatar upload, tracker persistence, and payment notify boundary behavior.
- A failed automated check exits with status code `1`.

## Email

- `EMAIL_ENABLED=false` disables outbound email delivery and skips digest email jobs.
- `EMAIL_ENABLED=true` requires `EMAIL_HOST`, `EMAIL_USER`, `EMAIL_PASSWORD`, and `EMAIL_FROM`.
- No email verification-code route is currently implemented; future verification-code checks must use `EMAIL_ENABLED`.

## AI Prompt Contract

- `GET /api/v1/ai/prompt/list` returns stable prompt ids, roles, and labels.
- Prompt role order is `normal`, `master`, `business`, `lark`, `hangtiancheng`.
- Prompt copy is English source text in server code and is marked pending product review.
- Localized prompt copy should be added through an allowed i18n resource, not source strings.

## AI Runtime

- Legacy AI service paths under `/ai/v1/*` are aliased to the new monolith AI routes for migration compatibility.
- Set `AI_PROVIDER=deepseek` to use the cloud DeepSeek provider through LangChain.
- Set `AI_PROVIDER=ollama` to use the local Ollama provider through LangChain.
- `OLLAMA_BASE_URL` defaults to `http://127.0.0.1:11434`.
- `OLLAMA_MODEL` defaults to `qwen3.5`.
- `OLLAMA_REASONER_MODEL` defaults to `deepseek-r1`.
- `/ready` verifies that both configured Ollama models are available from `OLLAMA_BASE_URL`.
- `deepThink=true` uses the DeepSeek reasoner model for DeepSeek, or `OLLAMA_REASONER_MODEL` for Ollama when configured.
- Set `BOCHA_ENABLED=true` to allow request-level `webSearch=true` to call Bocha search.
- Set `BOCHA_ENABLED=false` to ignore request-level `webSearch=true` and avoid network search calls.
- `BOCHA_SEARCH_URL` and `BOCHA_API_KEY` are validated before search requests are sent.

Prepare local Ollama models:

```bash
ollama pull qwen3.5
ollama pull deepseek-r1
```

Run local Ollama models:

```bash
ollama run qwen3.5
ollama run deepseek-r1
```

## Payment Status

- `POST /api/v1/pay/create` creates an internal payment order and returns `outTradeNo`.
- `GET /api/v1/pay/status/:outTradeNo` returns the authenticated user's payment status.
- Frontend clients should poll the status endpoint while checkout completion is handled asynchronously.
- A successful trusted notify callback updates the order and the purchased-course record atomically.
- `ALIPAY_ENABLED=false` keeps the current fallback response with `statusUrl` and upstream checkout metadata.
- `ALIPAY_ENABLED=true` creates an Alipay page checkout URL and returns `payUrl`, `outTradeNo`, `statusUrl`, and `timeExpire`.
- Enabled Alipay mode requires `ALIPAY_APP_ID`, `ALIPAY_PRIVATE_KEY`, `ALIPAY_PUBLIC_KEY`, `ALIPAY_GATEWAY`, and `ALIPAY_NOTIFY_URL`.
- Enabled Alipay notify callbacks are verified with the Alipay SDK before payment completion.
- Disabled Alipay mode uses `PAYMENT_NOTIFY_SECRET` to require trusted callbacks to include `x-payment-notify-secret`.
- Duplicate successful notify callbacks are ignored without writing course records again.

Alipay release checks:

- Keep local tests mocked; do not call the real Alipay gateway from unit tests.
- Validate sandbox credentials in staging with `ALIPAY_ENABLED=true` before production traffic.
- Treat `payUrl` as the external Alipay checkout URL and `statusUrl` as the authenticated polling URL.
- Roll back Alipay checkout by setting `ALIPAY_ENABLED=false`, which restores the internal fallback payment boundary.

## Deployment

- `GET /api/v1/word-book` remains public for compatibility with the old Nest service.
- Run `pnpm run ci` before building a release artifact.
- Run `pnpm staging:smoke` against staging before switching traffic.
- Run `pnpm db:deploy` against the target database before switching traffic.
- Run `pnpm db:seed` when bootstrapping a new environment or refreshing course defaults.
- Configure external dependencies before enabling `/ready` in load balancer checks.
- `/ready` reports payment configuration as `payment`; enabled Alipay mode fails readiness when required credentials or URLs are invalid.

## Rollout

- Start the Hono server beside the old Nest services and keep traffic on Nest.
- Verify `/health`, `/ready`, login, course list, learning access, payment create, tracker, and AI prompt routes.
- Send a small percentage of traffic to Hono and monitor request ids, response codes, trusted payment notify behavior, digest jobs, and email delivery.
- Increase traffic gradually after error rates and latency match the Nest baseline.
- Roll back by routing traffic back to the Nest services; keep database migrations backward compatible until the rollout is complete.

## Known Gaps

- Alipay SDK checkout URL generation is not implemented yet and must be enabled only by `ALIPAY_ENABLED=true`.
- The generic payment notify endpoint should only be exposed behind a trusted internal boundary or Alipay signature verification.
