# Server Migration Roadmap

## Scope

Migrate the old Nest.js microservice workspace in `apps/server-old` into the Hono.js monolith in `apps/server` while preserving API behavior where it is still part of the product contract, improving type safety, and adding meaningful Vitest coverage. Payment checkout now supports an optional Alipay SDK path behind `ALIPAY_ENABLED=true`; when the flag is disabled, the server must keep the existing internal payment order and status-polling behavior.

## Reviewed Sources

Old services:

- `apps/server-old/apps/server`: user, auth, word book, course, learning, payment, tracker, and Socket.IO payment notification APIs.
- `apps/server-old/apps/ai`: prompt list, streaming chat, chat history, and daily digest jobs.
- `apps/server-old/libs/shared`: Prisma, response wrapper, auth guard, MinIO, payment gateway wrapper, email, and cross-cutting Nest modules.
- `apps/server-old/prisma/seed.ts`: legacy course seed data and course image upload.

New monolith:

- `src/app.ts`: Hono app factory with middleware, health check, readiness check, route mounting, not-found handling, and global error handling.
- `src/index.ts`: Node server bootstrap plus MinIO and scheduled job startup.
- `src/modules/*`: Hono route modules for user, word book, course, learning, payment, tracker, and AI.
- `src/shared/*`: Prisma lifecycle, auth middleware, token schemas, response helpers, Redis, email, and object storage helpers.
- `prisma/seed.ts`: deterministic course seed script for current Hono environments.

## Migration Principles

- Keep Hono route boundaries Zod-first.
- Keep Prisma lifecycle centralized and transactional writes explicit.
- Keep external inputs parsed through schemas before use.
- Keep files small and single-purpose.
- Keep generated Prisma code exempt from source quality rules.
- Keep payment gateway SDK code disabled unless `ALIPAY_ENABLED=true`.

## Functional Parity Review

| Domain       | Old Nest.js capability                                                            | New Hono status                   | Remaining gap                                                                                         |
| ------------ | --------------------------------------------------------------------------------- | --------------------------------- | ----------------------------------------------------------------------------------------------------- |
| User auth    | Login, register, refresh token, update profile, upload avatar                     | Migrated and hardened             | Avatar MIME validation is still not enforced before MinIO upload                                      |
| Word book    | Authenticated list with filters, pagination, and frequency ordering               | Migrated                          | CSV import exists as a utility but is not wired into a documented seed/import command                 |
| Course       | Public course list and owned course list                                          | Migrated                          | Seed data no longer covers all 8 legacy course values or uploads course images                        |
| Learning     | Fetch words for purchased courses and save mastered words                         | Migrated and hardened             | Relies on course values being present in seed/import data                                             |
| Payment      | Legacy Alipay checkout URL creation, notify endpoint, and Socket.IO success event | Feature-flagged migration pending | Reintroduce Alipay SDK only when `ALIPAY_ENABLED=true`; keep status polling and idempotent completion |
| Tracker      | UV, PV, event, performance, and error collection                                  | Migrated and typed                | Database integration tests are still mocked rather than end-to-end                                    |
| AI prompt    | Prompt list with five roles                                                       | Migrated                          | Role ids are preserved, but prompt text and labels were English-normalized and need product sign-off  |
| AI chat      | SSE chat, deep thinking, web search, and history                                  | Migrated                          | External model and search contracts are covered by schema tests, not live integration tests           |
| Digest jobs  | Daily user filtering, delayed email digest, and email delivery                    | Migrated with Redis queue         | Needs staging verification with Redis, model provider, and SMTP together                              |
| Shared infra | Prisma, MinIO, response wrapper, auth guard, email                                | Migrated and hardened             | Prisma schema comments still mirror legacy annotations and need an English-only cleanup               |

## Review Findings

| No. | Finding                                                            | Evidence                                                                                                                  | Action                                                                                                                |
| --- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| 1   | Alipay checkout URL generation is not migrated behind the new flag | Old payment service generated an Alipay gateway page URL; new Hono route returns an internal status URL                   | Add a feature-flagged Alipay SDK adapter and preserve the disabled fallback response                                  |
| 2   | Payment success realtime notification is not migrated              | Old Socket.IO gateway emitted `paymentSuccess`; new Hono uses authenticated polling                                       | Keep polling as the replacement contract and avoid adding Socket.IO unless the product requires realtime UX           |
| 3   | Legacy course seed coverage is reduced                             | Old seed inserted 8 course values and uploaded course images; new seed inserts 3 courses only                             | Add a course seed parity milestone before production content migration                                                |
| 4   | Prompt contract changed beyond framework migration                 | Old prompt modes had localized labels and persona text; new prompt modes keep role ids but use English labels and prompts | Add product review for prompt text and frontend display expectations                                                  |
| 5   | Generic payment notify remains sensitive if exposed publicly       | New notify parser accepts trusted form data without a bundled SDK verifier                                                | Add Alipay signature verification when `ALIPAY_ENABLED=true` and keep trusted-secret protection for non-SDK callbacks |

## Delivery Model

- Each milestone starts with route-level or service-level Vitest tests where behavior is known.
- New features must include focused tests in the same milestone.
- Bug fixes must add regression tests when the behavior can be reproduced without external services.
- A milestone is complete only when `pnpm build`, `pnpm test`, `pnpm lint:ci`, and `pnpm prisma:validate` pass in `apps/server`.
- External integrations should be covered by schema validation and mocked tests before live verification.

## Milestone 0: Baseline Integration

Status: completed.

Deliverables:

- Export a Hono app factory for tests.
- Keep server bootstrap side effects out of tests.
- Restore TypeScript build compatibility.
- Add Vitest and baseline endpoint tests.
- Enforce `strict` and `exactOptionalPropertyTypes`.

Verification:

- `pnpm build`
- `pnpm test`

## Milestone 1: Contracts And Validation

Status: completed.

Goal: make all HTTP boundaries Zod-first and remove implicit contracts.

Deliverables:

- Move request and response schemas into small module-local schema files.
- Add environment variable validation for database, JWT, MinIO, AI, Redis, and email settings.
- Replace ad hoc query transforms with bounded schemas for pagination and filters.
- Validate external responses from Bocha Search and payment notify payloads.
- Document public route contracts in a compact API contract file when API documentation becomes part of release scope.

Tests:

- Invalid login, register, refresh token, and update profile payloads.
- Invalid word-book pagination and boolean query filters.
- Invalid tracker payloads.
- Missing required environment variables.

Completed notes:

- Added module-local Zod schemas for user, word book, AI, learning, payment, and tracker boundaries.
- Added environment parsing in `src/shared/config/env.ts`.
- Added route-level tests for invalid payloads and auth boundaries.

## Milestone 2: Data Access Layer

Status: completed.

Goal: centralize Prisma usage without recreating clients or hiding type errors.

Deliverables:

- Replace per-file Prisma construction with a shared Prisma client lifecycle.
- Add repository-style functions only where route handlers are becoming too large.
- Add transaction boundaries for learning progress and payment notify flows.
- Add graceful shutdown for Prisma and background workers.
- Keep Prisma generated code out of lint and test concerns.

Tests:

- Repository tests with mocked Prisma delegates for query shape.
- Transaction behavior for mastered-word saves.
- Duplicate word-save and duplicate payment notify handling.

Completed notes:

- Centralized Prisma client construction in `src/shared/prisma/client.ts`.
- Added shared connect and disconnect lifecycle helpers.
- Reused the shared Prisma client from cron and CSV import code.
- Wrapped mastered-word persistence and user count updates in one transaction.
- Used `createMany({ skipDuplicates: true })` and incremented by inserted count.
- Wrapped payment notify writes in one transaction and used `courseRecord.upsert` for idempotency.
- Added focused transaction tests for mastered-word save behavior.

## Milestone 3: User And Auth Hardening

Status: completed.

Goal: make authentication production-ready.

Deliverables:

- Hash passwords and migrate login comparison away from plaintext.
- Add refresh-token replay and token-type regression tests.
- Protect avatar upload with authentication.
- Validate multipart file size before writing to MinIO.
- Normalize user update behavior for nullable fields.

Tests:

- Successful login and register with mocked Prisma.
- Wrong password and duplicate phone or email.
- Access token accepted and refresh token rejected on protected routes.
- Avatar upload rejects missing or oversized files.

Completed notes:

- Added scrypt password hashing in `src/shared/auth/password.ts`.
- Registered users now store password hashes instead of plaintext passwords.
- Legacy plaintext passwords are still accepted once and rehashed on successful login.
- Token generation now includes `iat` and `jti` claims.
- Added explicit access-token and refresh-token verification helpers.
- Refresh endpoint now rejects access tokens with a 401 response before database access.
- Avatar upload now requires authentication before parsing multipart data.
- Added password hashing, token type, refresh-token, and avatar-auth regression tests.

## Milestone 4: Learning, Course, Payment, And Tracker

Status: completed.

Goal: reach parity for core product workflows while removing unsafe dynamic behavior.

Deliverables:

- Preserve course list and owned course response shape.
- Make learning word selection deterministic and configurable.
- Use `skipDuplicates` or explicit conflict handling for mastered words.
- Keep payment record and course record updates atomic.
- Replace realtime payment notification with a documented polling contract.
- Refine tracker event payload from string-only to typed JSON.

Tests:

- Purchased-course access returns words.
- Unpurchased-course access returns forbidden.
- Mastered-word save increments counters exactly once.
- Payment create rejects already purchased courses.
- Payment notify updates payment and course records atomically.
- Tracker endpoints create the expected records.

Completed notes:

- Replaced dynamic learning word filters with an explicit course-value whitelist.
- Kept course list and owned-course price formatting in a shared formatter.
- Kept mastered-word conflict handling through `createMany({ skipDuplicates: true })`.
- Kept payment notify writes atomic and idempotent with `courseRecord.upsert`.
- Refined tracker event payload validation from string-only to constrained JSON values.
- Added focused tests for course formatting, learning word filters, payment notify upsert behavior, and tracker payload handling.

## Milestone 5: AI, Digest, Redis, And Email

Status: completed.

Goal: restore AI workflows with reliable background processing.

Deliverables:

- Validate chat roles through a Zod enum derived from prompt configuration.
- Replace untyped AI stream chunk handling with narrowed schemas or type guards.
- Add Redis-backed digest queue compatible with the old BullMQ behavior.
- Restore email delivery with validated SMTP configuration.
- Add retry, failure logging, and idempotency for digest jobs.
- Separate prompt configuration from route implementation.

Tests:

- Prompt list returns stable role metadata.
- Chat rejects unknown roles.
- Chat history validates required query values.
- Digest job enqueues expected work for eligible users.
- Email sender handles success and failure paths.

Completed notes:

- Moved AI prompt configuration into `src/modules/ai/prompts.ts`.
- Derived chat role validation from the prompt role tuple.
- Added narrowed schemas for streamed AI message chunks and chat history items.
- Added Redis connection and BullMQ digest queue helpers.
- Replaced delayed `setTimeout` digest delivery with BullMQ jobs.
- Added idempotent digest job ids, retries, exponential backoff, and failure retention.
- Restored SMTP email delivery through a validated environment-backed sender.
- Added tests for prompt metadata, chat role validation, history validation, digest delay and queue options, message parsing, and email success/failure paths.

## Milestone 6: Operations And Release Readiness

Status: completed.

Goal: prepare the Hono monolith for deployment and rollback.

Deliverables:

- Add structured request IDs and consistent logging fields.
- Add readiness checks for PostgreSQL, Redis, MinIO, and AI dependencies.
- Add migration and seed commands for local and CI usage.
- Add CI commands for build, test, lint, and Prisma validation.
- Add rollout notes for switching traffic from the Nest services to Hono.

Tests:

- Health and readiness endpoint tests.
- Startup configuration validation tests.
- Smoke tests for every mounted route group.

Completed notes:

- Added request id middleware that generates or preserves `x-request-id`.
- Added `/ready` dependency checks for PostgreSQL, Redis, MinIO, and AI configuration.
- Added Prisma migration, deploy, validation, and seed scripts.
- Added a deterministic course seed script that updates by existing course id or creates missing defaults.
- Added CI script coverage for build, test, lint, and Prisma validation.
- Documented setup, readiness checks, deployment commands, rollout, and rollback notes in `README.md`.
- Added tests for readiness success and failure, request id behavior, startup env validation, and route group smoke coverage.

## Milestone 7: Payment SDK Removal And Boundary Definition

Status: completed.

Goal: ensure the Hono monolith contains no bundled payment gateway SDK while preserving internal payment records.

Direction update: this milestone records the previous no-SDK product decision. Milestone 20 and later supersede that decision by reintroducing Alipay SDK support behind `ALIPAY_ENABLED=true` while retaining the internal fallback behavior when the flag is disabled.

Deliverables:

- Remove payment SDK dependency, client wrapper, environment variables, and SDK tests.
- Keep internal payment order creation through Prisma.
- Keep idempotent payment completion through trusted notify payload parsing.
- Keep authenticated payment status polling as the replacement for realtime success notification.
- Document that external checkout is owned by an upstream trusted payment service.

Tests:

- Mock payment notify form parsing accepts successful trusted payloads.
- Malformed notify business body is rejected.
- Unsupported trade status is rejected.
- Payment status queries are scoped by authenticated user and `outTradeNo`.

Completed notes:

- Removed the payment SDK client file and dependency.
- Removed payment SDK environment variables from `env.ts` and `.env.example`.
- Replaced checkout URL generation with an internal payment status URL.
- Renamed notify parsing to generic payment notify parsing.
- Updated README payment documentation to make the no-SDK boundary explicit.

## Milestone 8: Code Quality Closure

Status: completed.

Goal: align the migrated source with project code-quality rules before broader review.

Deliverables:

- Remove non-English comments from shared `@ai-en/common` contracts.
- Replace loose shared tracker payload typing with `unknown`.
- Split oversized Hono route files by responsibility.
- Keep route entry files as small composition roots.
- Keep behavior unchanged while reducing route-file review size.

Tests:

- Existing app, route smoke, auth boundary, payment, tracker, AI, and service tests remain green.
- CI build, lint, and Prisma validation remain green after refactors.

Completed notes:

- Cleaned shared chat, course, learn, pay, tracker, user, and word contracts.
- Split user routes into auth routes, profile routes, and a shared user selection module.
- Split AI runtime dependencies and search prompt construction out of the AI route entry.
- Split tracker routes into visitor metrics and event/error reporting routers.
- Split payment service interfaces into `service.types.ts`.
- Moved auth boundary tests out of the app smoke test file.
- Reduced the largest non-generated server source file below the 150-line hard ceiling.

## Milestone 9: Content Seed And Course Asset Parity

Status: completed.

Goal: restore legacy course catalog coverage without reintroducing unsafe seed behavior.

Deliverables:

- Seed all legacy course values: `gk`, `zk`, `gre`, `toefl`, `ielts`, `cet6`, `cet4`, and `ky`.
- Move seed data into a typed data module or JSON fixture with English-only text.
- Upload or reference course images through MinIO with deterministic object names.
- Keep seed idempotent by updating existing records by stable course value lookup.
- Add a documented word-book CSV import command for `readLargeCsv` or remove the unused utility.

Tests:

- Seed data contains every course value supported by learning word selection.
- Course image URLs are deterministic and non-empty.
- Re-running seed does not create duplicate courses.
- Word-book import command validates required CSV headers before inserting rows.

Completed notes:

- Added typed course seed data covering every legacy course value used by learning filters.
- Copied the legacy course image assets into the new server seed assets directory.
- Added a seed service that uploads deterministic course images to the `course` bucket.
- Kept course seeding idempotent by finding existing courses by value and updating by id.
- Added `pnpm word-book:import` for ECDICT-compatible CSV imports.
- Added required CSV header validation before inserting word-book rows.
- Added focused tests for course seed coverage, deterministic asset paths, idempotent seed behavior, and CSV header validation.

## Milestone 10: Payment Boundary Hardening

Status: completed.

Goal: make no-SDK payment behavior safe and explicit for production deployment.

Direction update: this milestone remains valid for the disabled-SDK fallback and first-party callback boundary. Alipay notify handling must add gateway signature verification rather than relying only on this trusted-secret boundary when `ALIPAY_ENABLED=true`.

Deliverables:

- Restrict `POST /api/v1/pay/notify` to trusted infrastructure through middleware, header validation, or network-level deployment rules.
- Define a first-party signed callback schema if notify must cross an untrusted network.
- Add replay protection for payment completion callbacks.
- Return a clearer payment create response that distinguishes internal `statusUrl` from external checkout ownership.
- Document the upstream payment service contract expected by the Hono server.

Tests:

- Notify rejects missing trusted callback credentials when the boundary is enabled.
- Duplicate callback replay leaves payment and course records unchanged.
- Payment create response does not imply this server generated an external checkout URL.

Completed notes:

- Added `PAYMENT_NOTIFY_SECRET` and `x-payment-notify-secret` as the first-party trusted callback boundary.
- Moved notify boundary validation before Prisma middleware so untrusted callbacks do not touch database state.
- Converted the pay router into an injectable factory for focused Hono route tests.
- Replaced the old `payUrl` field with `statusUrl` and explicit upstream checkout ownership metadata.
- Added replay protection for already successful payment callbacks.
- Added focused tests for trusted boundary validation, route-level reject behavior, payment order response shape, and replay handling.

## Milestone 11: Prompt Contract And Product Copy Review

Status: completed.

Goal: confirm AI prompt behavior after moving from legacy localized prompt text to English-only source files.

Deliverables:

- Review all prompt roles with product owners: `normal`, `master`, `business`, `lark`, and `hangtiancheng`.
- Decide whether localized prompt text belongs in an allowed i18n resource instead of source code.
- Keep role ids stable for frontend compatibility.
- Add contract tests for prompt list labels and role ordering.

Tests:

- Prompt list returns the expected role ids in stable order.
- Chat role validation rejects unknown roles.
- Any localized prompt resource is loaded only through an allowed i18n path.

Completed notes:

- Kept legacy prompt roles and ids stable for frontend compatibility.
- Added prompt contract metadata with `en-US` source copy and pending product review status.
- Added review item exports so product copy can be reviewed without changing public route shape.
- Kept `/api/v1/ai/prompt/list` response compatible with existing id, label, and role fields.
- Documented that future localized prompt copy must live in an allowed i18n resource.
- Added tests for prompt metadata stability, role validation, unique ids, role ordering, and review metadata.

## Milestone 12: Staging Integration Verification

Status: completed.

Goal: verify external dependencies together before production cutover.

Deliverables:

- Run staged smoke tests for PostgreSQL, Redis, MinIO, model provider, search provider, and SMTP.
- Verify digest queue scheduling, worker processing, and email delivery in one environment.
- Verify upload avatar with real MinIO-compatible storage.
- Verify tracker writes against a staging database.
- Record rollback criteria and owners for each dependency.

Tests:

- `/ready` is green in staging.
- Digest email is delivered for a controlled test user.
- Avatar upload stores and returns a readable object URL.
- Tracker endpoints persist records that can be queried from the database.

Completed notes:

- Added `pnpm staging:smoke` as the executable staging verification entrypoint.
- Added a Zod-validated smoke configuration for `STAGING_BASE_URL` and `STAGING_SMOKE_TIMEOUT_MS`.
- Added automated staging checks for `/health` and `/ready`.
- Added required staging environment key reporting for PostgreSQL, Redis, MinIO, AI, SMTP, and payment notify boundaries.
- Added manual check reporting with owners and rollback criteria for digest email, avatar upload, tracker persistence, and payment notify boundaries.
- Documented staging smoke usage and deployment gating in `README.md`.
- Added focused tests for smoke env parsing, required dependency keys, passing reports, and failed readiness reports.

## Milestone 13: LangChain Runtime Provider Review

Status: completed.

Goal: verify the current LangChain integration before adding provider selection.

Review findings:

- `.env.example` documents `AI_PROVIDER`, but `src/shared/config/env.ts` does not parse it, so runtime behavior is always DeepSeek-only.
- `.env.example` documents `BOCHA_ENABLED`, but `src/shared/config/env.ts` does not parse it, so request-level `webSearch` can call Bocha even when the environment should disable search.
- `src/modules/ai/runtime.ts` hard-codes `ChatDeepSeek` factories and does not expose a provider-neutral chat model factory.
- `src/modules/ai/cron.ts` also calls `createDeepSeekInstance()`, so digest generation will ignore any future provider setting unless the cron path is migrated too.
- `createBochaSearch()` parses the response body with Zod, but it does not handle non-2xx HTTP responses or missing Bocha configuration before making the request.
- Bocha search is currently prompt augmentation, not a LangChain tool, so tool routing and search observability are limited.

Deliverables:

- Add an explicit review note covering chat streaming, digest generation, checkpointing, and Bocha search boundaries.
- Define the provider abstraction needed by both `/api/v1/ai/chat` and digest cron generation.
- Decide whether Bocha remains prompt augmentation in the short term or becomes a LangChain tool in a later milestone.

Tests:

- Existing AI route smoke tests continue to pass.
- Existing digest service tests continue to pass.

## Milestone 14: AI Provider Selection With DeepSeek And Ollama

Status: completed.

Goal: support both cloud DeepSeek and local Ollama through LangChain with one validated provider configuration.

Deliverables:

- Parse `AI_PROVIDER` as a Zod enum with supported values `deepseek` and `ollama`.
- Add Ollama environment variables such as base URL and chat model name with safe local defaults.
- Add `@langchain/ollama` as the runtime dependency for local model support.
- Replace DeepSeek-only factories with provider-neutral chat model factories.
- Preserve DeepSeek reasoner behavior when `AI_PROVIDER=deepseek` and `deepThink=true`.
- Define the expected behavior for `deepThink=true` when `AI_PROVIDER=ollama`.
- Update chat and digest cron paths to use the same provider selection.

Tests:

- Environment parsing accepts `AI_PROVIDER=deepseek` and `AI_PROVIDER=ollama`.
- Environment parsing rejects unsupported provider values.
- Runtime model factory selects DeepSeek for `deepseek`.
- Runtime model factory selects Ollama for `ollama`.
- Digest generation uses the provider-neutral factory instead of `createDeepSeekInstance()`.

Completed notes:

- Added `AI_PROVIDER` validation with supported values `deepseek` and `ollama`.
- Added `OLLAMA_BASE_URL`, `OLLAMA_MODEL`, and `OLLAMA_REASONER_MODEL` configuration.
- Added `@langchain/ollama` and aligned LangChain package versions.
- Added provider-neutral `createChatModel()` and injectable `createChatModelForEnv()` factories.
- Added provider-neutral LangChain agent model identifiers so `createAgent()` receives string model IDs instead of a `ChatOllama | ChatDeepSeek` union.
- Kept DeepSeek reasoner selection for `deepThink=true` when using DeepSeek.
- For Ollama, `deepThink=true` uses `OLLAMA_REASONER_MODEL` when configured and falls back to `OLLAMA_MODEL`.
- Updated chat streaming and digest cron generation to use the provider-neutral agent factory.
- Added focused tests for provider env validation, DeepSeek model selection, Ollama model selection, agent model identifiers, and Ollama reasoner fallback.

## Milestone 15: Bocha Search Feature Flag

Status: completed.

Goal: make network search explicitly controlled by `BOCHA_ENABLED`.

Deliverables:

- Parse `BOCHA_ENABLED` through the shared boolean environment schema.
- Only call Bocha when both `BOCHA_ENABLED=true` and request `webSearch=true`.
- Return deterministic behavior when search is requested but disabled.
- Validate Bocha URL and API key before network calls when search is enabled.
- Handle non-2xx Bocha responses with a typed error path.
- Document the interaction between request-level `webSearch` and environment-level `BOCHA_ENABLED`.

Tests:

- Search is skipped when `BOCHA_ENABLED=false`.
- Search is called when `BOCHA_ENABLED=true` and request `webSearch=true`.
- Search is skipped when request `webSearch` is absent or false.
- Invalid Bocha configuration fails fast when search is enabled.
- Non-2xx Bocha responses are handled without leaking raw provider errors.

Completed notes:

- Added `BOCHA_ENABLED` to shared environment validation.
- Moved Bocha search behavior into `src/modules/ai/bocha-search.ts` to keep AI runtime provider logic separate from network search.
- Added `shouldUseBochaSearch()` so chat calls Bocha only when both the environment flag and request flag are enabled.
- Added Bocha URL and API key validation before fetch calls.
- Added a typed `BochaSearchError` for non-success provider responses.
- Documented AI provider and Bocha search configuration in `README.md`.
- Added focused tests for search gating, invalid configuration, successful formatting, and non-success responses.

## Milestone 16: Provider-Aware AI Readiness

Status: completed.

Goal: make `/ready` and staging smoke reports reflect the selected AI provider.

Deliverables:

- Make AI readiness use `AI_PROVIDER` instead of always checking DeepSeek credentials.
- Require `DEEPSEEK_API_KEY` only when `AI_PROVIDER=deepseek`.
- Allow `AI_PROVIDER=ollama` without DeepSeek credentials when `OLLAMA_MODEL` is configured.
- Validate Bocha URL and API key during readiness when `BOCHA_ENABLED=true`.
- Make staging smoke required env keys provider-specific.
- Document provider-specific readiness behavior.

Tests:

- DeepSeek readiness fails when `DEEPSEEK_API_KEY` is missing.
- Ollama readiness passes without DeepSeek credentials.
- Bocha-enabled readiness fails when search config is invalid.
- Staging smoke reports DeepSeek keys for DeepSeek and Ollama keys for Ollama.

Completed notes:

- Updated `createAiConfigCheck()` to accept injectable config and evaluate DeepSeek, Ollama, and Bocha configuration independently.
- Updated staging smoke parsing to include `AI_PROVIDER`.
- Added provider-specific staging required env key generation.
- Updated readiness and staging smoke documentation in `README.md`.
- Added focused tests for provider-aware readiness and staging env key reporting.

## Milestone 17: Prompt Role Contract Sync

Status: completed.

Goal: keep renamed AI prompt roles synchronized across code, tests, and documentation.

Deliverables:

- Preserve the renamed prompt role order: `normal`, `master`, `business`, `lark`, `hangtiancheng`.
- Bump the prompt contract version after the public role contract change.
- Add a README contract test so documented prompt role order cannot drift from `chatRoles`.
- Keep prompt metadata tests aligned with the renamed roles.

Tests:

- Prompt metadata returns stable ids, labels, and renamed roles.
- README prompt role order matches the runtime `chatRoles` tuple.

Completed notes:

- Updated `chatPromptContract.version` to `2026-05-18`.
- Added `src/modules/ai/readme-prompt-contract.test.ts`.
- Verified the README role order matches `chatRoles`.

## Milestone 18: Ollama Default Model Alignment

Status: completed.

Goal: align local Ollama defaults with the intended chat and reasoning models.

Deliverables:

- Default Ollama chat model to `qwen3.5`.
- Default Ollama reasoning model to `deepseek-r1`.
- Update local `.env` and `.env.example` with the same defaults.
- Document Ollama model pull and run commands in `README.md`.
- Keep runtime, readiness, and env tests aligned with the new defaults.

Tests:

- Env parsing defaults Ollama chat to `qwen3.5`.
- Env parsing defaults Ollama reasoning to `deepseek-r1`.
- Runtime model selection uses `ollama:qwen3.5` and `ollama:deepseek-r1`.
- Readiness tests use the intended local chat model.

Completed notes:

- Updated `OLLAMA_MODEL` default to `qwen3.5`.
- Updated `OLLAMA_REASONER_MODEL` default to `deepseek-r1`.
- Added README commands for `ollama pull` and `ollama run`.

## Milestone 19: Ollama Runtime Readiness

Status: completed.

Goal: fail readiness when the selected local Ollama provider cannot serve the configured models.

Deliverables:

- Add a dedicated Ollama readiness helper for `/api/tags`.
- Validate Ollama tag responses with `zod`.
- Match installed Ollama tags such as `qwen3.5:latest` against configured model names.
- Verify both chat and reasoning models when `AI_PROVIDER=ollama`.
- Keep readiness tests fully injectable without requiring a real local Ollama process.
- Document Ollama readiness behavior in `README.md`.

Tests:

- Ollama readiness accepts installed tagged models.
- Ollama readiness reports missing local models.
- Ollama readiness reports non-success local service responses.
- AI readiness fails when local Ollama models are unavailable.

Completed notes:

- Added `src/operations/ollama-readiness.ts`.
- Added `src/operations/ollama-readiness.test.ts`.
- Updated `createAiConfigCheck()` to call Ollama model readiness only for `AI_PROVIDER=ollama`.
- Updated readiness docs for local Ollama model verification.

## Milestone 20: Alipay Migration Contract

Status: completed.

Goal: define the feature-flagged Alipay SDK contract before changing runtime payment behavior.

Deliverables:

- Treat `ALIPAY_ENABLED=true` as the only switch that enables Alipay SDK code paths.
- Keep `ALIPAY_ENABLED=false` compatible with the current internal order, `statusUrl`, and upstream checkout metadata response.
- Document the old Nest.js Alipay behavior that must be migrated: `pageExecute("alipay.trade.page.pay", "GET", ...)`, `FAST_INSTANT_TRADE_PAY`, `notify_url`, `out_trade_no`, `trade_no`, and `gmt_payment`.
- Preserve the Hono improvements from completed payment milestones: Zod validation, idempotent `completePayment`, authenticated status polling, and no Socket.IO dependency.
- Decide the callback trust model for enabled Alipay mode: Alipay signature verification is mandatory, while `PAYMENT_NOTIFY_SECRET` remains available for non-SDK or private callback deployments.

Tests:

- Env parsing accepts `ALIPAY_ENABLED=true` and `ALIPAY_ENABLED=false`.
- Disabled Alipay mode keeps the current payment create response shape.
- Roadmap and README payment wording do not claim that gateway SDK support is impossible when `ALIPAY_ENABLED=true`.

Completed notes:

- Added `ALIPAY_ENABLED` to the validated environment schema.
- Added env tests for enabled, disabled, and default-disabled Alipay flags.
- Kept disabled Alipay payment create behavior as the current fallback contract.
- Updated README wording to describe optional Alipay SDK support instead of a permanent no-SDK policy.

## Milestone 21: Alipay Env And SDK Adapter

Status: completed.

Goal: migrate the old shared Nest `PayService` SDK initialization into small Hono-compatible modules with strict runtime validation.

Deliverables:

- Add Zod-validated Alipay environment fields: `ALIPAY_ENABLED`, `ALIPAY_APP_ID`, `ALIPAY_PRIVATE_KEY`, `ALIPAY_PUBLIC_KEY`, `ALIPAY_GATEWAY`, and `ALIPAY_NOTIFY_URL`.
- Require complete Alipay credentials only when `ALIPAY_ENABLED=true`.
- Add an Alipay SDK adapter module with an injectable interface for checkout URL creation and signature verification.
- Avoid non-null assertions, type assertions, and unvalidated `process.env` reads.
- Add the `alipay-sdk` dependency only as part of the enabled adapter milestone.

Tests:

- Env parsing fails fast when Alipay is enabled with missing credentials.
- Env parsing allows missing Alipay credentials when Alipay is disabled.
- SDK adapter tests mock `pageExecute` without calling the real gateway.
- Signature verification tests use mocked SDK verification behavior.

Completed notes:

- Added `alipay-sdk` to the server dependency set.
- Added conditional Alipay credential validation in `src/shared/config/env.ts`.
- Added `.env.example` placeholders for the Alipay app id, keys, gateway, and notify base URL.
- Added `src/modules/pay/alipay-adapter.ts` with injectable checkout URL and notify signature verification methods.
- Added mock SDK tests for page pay parameter mapping, checkout URL delegation, and signature verification delegation.
- Updated README payment configuration notes for the enabled Alipay credential contract.

## Milestone 22: Alipay Checkout Creation

Status: completed.

Goal: migrate the old Nest payment create flow into the Hono payment route when Alipay is enabled.

Deliverables:

- Keep `POST /api/v1/pay/create` authenticated and Zod-validated.
- Continue rejecting duplicate purchases before creating a new payment record.
- Create the payment record transactionally before returning a checkout response.
- Generate the Alipay page URL with `alipay.trade.page.pay`, `FAST_INSTANT_TRADE_PAY`, and a one-minute expiration matching the old behavior.
- Encode payment business metadata as validated JSON containing `courseId` and `userId`.
- Return `payUrl`, `outTradeNo`, `statusUrl`, and `timeExpire` when Alipay is enabled.
- Preserve the existing fallback response when Alipay is disabled.

Tests:

- Enabled Alipay mode calls the adapter with expected `out_trade_no`, amount, subject, body, product code, expiration, and notify URL.
- Disabled Alipay mode does not initialize or call the adapter.
- Duplicate purchase rejection happens before SDK checkout generation.
- Payment create response includes a status polling URL in both enabled and disabled modes.

Completed notes:

- Added feature-flagged Alipay checkout response construction in `src/modules/pay/order.ts`.
- Preserved the disabled fallback response with `statusUrl` and upstream checkout metadata.
- Added `payUrl`, `outTradeNo`, `statusUrl`, and `timeExpire` to the enabled Alipay checkout response.
- Encoded Alipay business metadata as JSON with `courseId` and `userId`.
- Split payment create routing into `src/modules/pay/create-route.ts` to keep route files below the line ceiling.
- Wired `POST /api/v1/pay/create` to use the injected or env-created Alipay client only when `ALIPAY_ENABLED=true`.
- Added focused tests for enabled checkout response mapping, notify URL generation, expiration formatting, and fallback response shape.

## Milestone 23: Alipay Notify Verification

Status: completed.

Goal: migrate Alipay notify handling safely without copying the old unsigned callback behavior.

Deliverables:

- Parse Alipay callback form data through Zod before using business fields.
- Verify Alipay signatures before completing payment when `ALIPAY_ENABLED=true`.
- Accept only successful Alipay trade statuses such as `TRADE_SUCCESS`.
- Decode and validate the Alipay `body` JSON payload for `courseId` and `userId`.
- Reuse `completePayment()` so successful callbacks remain idempotent and atomic.
- Return gateway-compatible `success` or `fail` text responses.
- Keep the trusted-secret callback path for disabled Alipay deployments.

Tests:

- Valid signed Alipay notify completes the payment and upserts the course record.
- Invalid signature returns `fail` and does not touch Prisma.
- Unsupported trade status returns `fail`.
- Malformed business body returns `fail`.
- Duplicate successful notify calls remain idempotent.

Completed notes:

- Added `parseVerifiedAlipayNotifyInput()` to verify Alipay signatures before mapping notify input.
- Split notify routing into `src/modules/pay/notify-route.ts`.
- Skipped the trusted-secret middleware in enabled Alipay mode and required SDK signature verification instead.
- Kept the trusted-secret callback path for disabled Alipay deployments.
- Kept successful callback completion on the existing idempotent payment service path.
- Added route tests for invalid Alipay signatures and valid signed Alipay callbacks.
- Added parser tests for signed Alipay callback behavior.

## Milestone 24: Alipay Release Readiness

Status: completed.

Goal: make the optional Alipay integration operable, documented, and safe to release.

Deliverables:

- Update `.env.example` and README with the Alipay flag, required credentials, notify URL, and disabled-mode behavior.
- Add readiness or staging-smoke reporting for required Alipay keys when `ALIPAY_ENABLED=true`.
- Document local testing strategy using mocked SDK tests and staging validation with sandbox credentials.
- Confirm that payment docs distinguish `payUrl` from `statusUrl`.
- Add rollback guidance: set `ALIPAY_ENABLED=false` to return to the internal fallback payment boundary.

Tests:

- Staging smoke required key reporting includes Alipay keys only when Alipay is enabled.
- README or env contract tests confirm the documented Alipay flag matches `env.ts`.
- Existing payment tests pass in both enabled and disabled configurations.

Completed notes:

- Added conditional staging-smoke required env reporting for `ALIPAY_ENABLED=true`.
- Added conditional staging-smoke required env reporting for `EMAIL_ENABLED=true`.
- Kept `PAYMENT_NOTIFY_SECRET` in staging required keys only for disabled Alipay deployments.
- Split staging env-key construction into `src/operations/staging-env-keys.ts`.
- Documented mocked local tests, staging sandbox validation, `payUrl` versus `statusUrl`, and rollback by setting `ALIPAY_ENABLED=false`.
- Ran payment and staging smoke tests across enabled and disabled branches.

## Milestone 25: Payment Readiness Reporting

Status: completed.

Goal: expose payment configuration readiness through `/ready` so staging and load balancer checks can detect broken Alipay configuration before traffic reaches checkout.

Deliverables:

- Add a payment readiness dependency status.
- Keep disabled Alipay mode ready while reporting whether the internal fallback has a shared notify secret.
- Fail enabled Alipay mode when required credentials or URLs are missing or malformed.
- Keep AI readiness logic separate from payment readiness logic.
- Preserve source files below the line ceiling by splitting readiness responsibilities.

Tests:

- Disabled Alipay fallback readiness passes without Alipay credentials.
- Enabled Alipay readiness fails when credentials are missing.
- Enabled Alipay readiness fails when gateway or notify URLs are invalid.
- Enabled Alipay readiness passes with complete credentials and valid URLs.

Completed notes:

- Split shared readiness types into `src/operations/readiness-types.ts`.
- Moved AI provider readiness to `src/operations/ai-readiness.ts`.
- Added payment readiness in `src/operations/payment-readiness.ts`.
- Added payment readiness to `defaultReadinessChecks()`.
- Added focused payment readiness tests and kept existing `/ready` tests passing.
- Documented the payment dependency in README deployment guidance.

## Milestone 26: API Compatibility Closure

Status: completed.

Goal: close the remaining route-level compatibility gaps found during the final old-versus-new project review.

Deliverables:

- Keep `GET /api/v1/word-book` public because the old Nest `word-book` endpoint did not require authentication.
- Add a legacy AI route alias for the old standalone AI service prefix `/ai/v1/*`.
- Preserve the new monolith routes under `/api/v1/*`.
- Add route contract tests for the compatibility behavior.
- Document the compatibility decisions in README.

Tests:

- Public word-book query reaches query validation without requiring an access token.
- `/api/v1/ai/prompt/list` remains available.
- `/ai/v1/prompt/list` is available as a legacy AI alias.
- Existing protected routes remain protected.

Completed notes:

- Removed the global `authMiddleware` from `src/modules/word-book/index.ts`.
- Mounted `aiRouter` at both `/api/v1/ai` and `/ai/v1`.
- Updated app and route smoke tests for the compatibility contract.
- Documented public word-book and legacy AI alias behavior.

## Open Risks

- Alipay sandbox credentials still need to be exercised in a real staging environment before production traffic.
- The generic payment notify endpoint must stay protected by either Alipay signature verification or the trusted-secret boundary.
- AI prompt text changed during English-only cleanup and needs product approval.
- Staging manual checks must be executed with real Redis, MinIO, SMTP, model, and database credentials before production traffic.
- Existing generated Prisma files contain comments and suppression directives from the generator; keep them exempt from source rules.
- Prisma schema comments still mirror legacy database annotations and should be translated in a schema-only cleanup.
- Local Ollama behavior still depends on model quality and local hardware capacity.
- Search-enabled chat depends on Bocha availability, quota, and response shape stability.
