# React 19 Migration Roadmap

## Scope

Migrate the legacy Vue 3 application in `apps/web-old` into the React 19 application in `apps/web`.
The migration keeps the product capabilities from the legacy app while replacing framework, UI, routing, state, data fetching, validation, security, and testing foundations.

## Current Status

- Functional parity is complete for the migrated React application.
- The React app covers the legacy home, auth, chat, courses, learning, word book, settings, payment, realtime, speech, avatar, and profile flows.
- The legacy Three.js hologram has been intentionally replaced by the vocabulary marquee required by the React migration direction.
- The legacy home GSAP behavior is restored through a reusable React motion hook with reduced-motion safeguards, stat counters, section entrance animation, and scroll-triggered feature-card animation.
- Remaining release work is production manual QA, provider-matrix smoke checks, and traffic switch execution.

## Source Inventory

- Routes: home, chat, courses, course learning, word book, and settings.
- Layout: shell layout, header, content area, and profile area.
- Auth: login, register, token refresh, persisted user session, logout, and profile update.
- API domains: auth, user, chat, course, learn, pay, word book, and SSE chat streaming.
- Realtime domains: SSE chat streaming and socket connection lifecycle.
- Browser features: audio playback, avatar upload, speech-to-text, focus behavior, vocabulary motion, and home landing motion.
- Public assets: serve static Vite and MSW worker assets from `apps/web/public`.

## Migration Principles

- Use strict TypeScript and runtime validation for every trust boundary.
- Use `zod` schemas as the single source of truth for external payloads and environment variables.
- Use React 19 with small, responsibility-focused files and kebab-case paths.
- Use daisyUI components and `lucide-react` icons.
- Use Tailwind CSS v4 and `clsx`; avoid custom CSS selectors except framework-level globals.
- Keep all source and documentation text in English.
- Prevent XSS in rendered Markdown, streamed chat content, uploaded metadata, and user profile fields.
- Add or update Vitest coverage for migrated behavior before marking milestones complete.

## Provider Strategy

### Data Fetching

- Support `SWR_PROVIDER=swr` with `swr`.
- Support `SWR_PROVIDER=tanstack` with `@tanstack/react-query`.
- Default to `swr`.
- Hide provider-specific APIs behind a single app-facing query and mutation adapter.

### State Management

- Support `STORE_PROVIDER=zustand` with persisted auth state.
- Support `STORE_PROVIDER=jotai` with equivalent persisted auth state.
- Default to `zustand`.
- Keep auth selectors, mutations, and persistence behavior identical across providers.

### Routing

- Support `ROUTER_PROVIDER=react-router` with `react-router` and `react-router-dom` in data mode.
- Support `ROUTER_PROVIDER=tanstack` with `@tanstack/react-router`.
- Default to `react-router`.
- Keep route paths stable unless a path change is explicitly documented.

## Target Architecture

- `src/app`: app bootstrap, providers, router mounting, and global error boundaries.
- `src/features/auth`: login, register, session state, token refresh, and guarded actions.
- `src/features/chat`: chat roles, history loading, message composition, and SSE streaming.
- `src/features/courses`: course list, owned courses, payment entry, and course learning.
- `src/features/word-book`: word book query, list rendering, and pagination or filtering.
- `src/features/settings`: editable user profile, avatar upload, and timing task settings.
- `src/app/pages`: landing experience, GSAP-backed home motion, route pages, and page shells.
- `src/shared/api`: HTTP clients, response schemas, auth refresh queue, and endpoint functions.
- `src/shared/config`: parsed environment variables and provider selection.
- `src/shared/security`: sanitization, safe Markdown rendering, and content validation.
- `src/shared/ui`: daisyUI-based shared states and reusable UI primitives.
- `src/shared/realtime`: socket and SSE primitives.
- `src/shared/browser`: audio, speech recognition, focus, and browser capability helpers.

## Milestones

### M0: Migration Baseline

Goal: make the React app ready for feature migration with enforced project rules.

Deliverables:

- Replace the Vite starter screen with an empty application shell.
- Add required dependencies for `zod`, Vitest, Testing Library, router providers, store providers, and XSS-safe Markdown rendering.
- Update TypeScript configuration with `strict` and `exactOptionalPropertyTypes`.
- Strengthen ESLint for no `any`, no unsafe access, no non-null assertions, no TypeScript suppression comments, max lines, kebab-case filenames, and CJK blocking.
- Add `test`, `typecheck`, and strict lint scripts.
- Add a basic smoke test for app bootstrap.

Acceptance criteria:

- `pnpm --filter @ai-en/web build` succeeds.
- `pnpm --filter @ai-en/web lint` succeeds with zero warnings.
- `pnpm --filter @ai-en/web test` succeeds.
- No application source file depends on Vue, Element Plus, Pinia, or Vue Router.

### M1: Configuration And Provider Abstractions

Goal: add validated runtime selection for data, state, and router providers.

Deliverables:

- Add a `zod` environment schema for `SWR_PROVIDER`, `STORE_PROVIDER`, and `ROUTER_PROVIDER`.
- Implement data fetching adapters for SWR and TanStack Query.
- Implement state adapters for Zustand and Jotai.
- Implement router factories for React Router data mode and TanStack Router.
- Add provider composition in the app bootstrap.
- Add tests for default provider selection and supported provider values.

Acceptance criteria:

- Missing provider environment variables resolve to documented defaults.
- Invalid provider values fail fast through schema validation.
- Tests verify all provider branches without duplicating feature code.
- App-facing code imports provider-neutral hooks and components only.

### M2: API Client, Schemas, And Auth Session

Goal: migrate HTTP behavior with safe validation and token refresh.

Deliverables:

- Create server and AI HTTP clients with validated base URLs and timeout settings.
- Replace legacy response interfaces with `zod` response schemas.
- Add endpoint modules for auth, user, chat, course, learn, pay, and word book.
- Implement refresh-token isolation to avoid retry loops.
- Implement a typed refresh queue for concurrent `401` responses.
- Implement persisted session state through the selected store provider.
- Add login, register, logout, token update, and profile update actions.

Acceptance criteria:

- All HTTP responses are parsed before app code consumes them.
- Token refresh retries queued requests once with the new access token.
- Failed refresh clears the session and redirects through the selected router provider.
- Tests cover success, network failure, non-auth failure, refresh success, and refresh failure.

### M3: Layout, UI System, And Navigation

Goal: migrate the shared application frame with daisyUI and stable routes.

Deliverables:

- Build the root layout, header, content region, and profile menu in React.
- Replace Element Plus components with daisyUI components.
- Replace Element Plus icons with `lucide-react`.
- Define route entries for `/`, `/chat/index`, `/courses/index`, `/courses/learn/:courseId/:title`, `/word-book/index`, and `/setting/index`.
- Add loading, empty, and error states shared by route pages.
- Add route-level tests for both router providers where practical.

Acceptance criteria:

- Navigation reaches every migrated route through the selected router provider.
- Layout files stay within responsibility and line-count limits.
- UI components use Tailwind CSS v4 utilities and `clsx` composition.
- No custom page-level CSS selectors are introduced.

### M4: Home, Auth Modal, And Vocabulary Marquee

Goal: migrate the entry experience and authentication flows.

Deliverables:

- Migrate the home page and vocabulary marquee experience.
- Load mock English vocabulary through MSW during local development.
- Migrate login and register forms with validated form inputs.
- Add authenticated action gating that opens the auth flow when no session exists.
- Migrate avatar display and upload behavior.
- Add XSS-safe rendering for any user-controlled profile content.

Acceptance criteria:

- Login and registration update the selected store provider consistently.
- The vocabulary marquee renders accessible fallback words and upgrades from the mock feed when available.
- Form tests cover validation, submit success, submit failure, and session persistence.
- User-controlled fields are sanitized or escaped before rendering.

### M5: Chat And Realtime Messaging

Goal: migrate chat roles, history, SSE streaming, and realtime lifecycle behavior.

Deliverables:

- Migrate conversation role selection.
- Migrate chat history loading by user and role.
- Migrate message composition with deep-think and web-search options.
- Implement typed SSE streaming for reasoning and chat chunks.
- Add safe Markdown rendering for AI output.
- Migrate socket connection lifecycle if still required by active features.
- Add audio and speech-to-text hooks with browser capability guards.

Acceptance criteria:

- Chat history and streamed responses are schema-validated.
- SSE updates append to the intended in-flight assistant message.
- Markdown output is sanitized before rendering.
- Tests cover role switching, send flow, stream chunk handling, stream errors, and unsupported speech recognition.

### M6: Courses, Learning, And Payment

Goal: migrate course discovery, owned courses, learning flow, and payment creation.

Deliverables:

- Migrate course list and owned-course views.
- Migrate the payment entry component.
- Migrate course learning route and word list loading.
- Migrate word mastery submission.
- Add route parameter validation for `courseId` and `title`.
- Add user feedback for loading, empty, locked, and paid states.

Acceptance criteria:

- Course and learning API responses are parsed through schemas.
- Learning route rejects invalid params before fetching.
- Payment creation handles success, cancel, and failure outcomes.
- Tests cover course list loading, learning progress submission, and payment request behavior.

### M7: Word Book And Settings

Goal: migrate user-owned content and profile management.

Deliverables:

- Migrate word book search, filters, result list, and pagination behavior.
- Migrate settings page fields for name, email, address, avatar, bio, timing task flag, and timing task time.
- Reuse auth session update actions after profile updates.
- Add input validation and safe display for profile and word content.
- Add focused accessibility checks for forms and interactive controls.

Acceptance criteria:

- Word book query params are schema-validated before requests.
- Profile update payloads are schema-validated before submission.
- Session state reflects successful profile updates.
- Tests cover word book query behavior, profile edit success, profile edit failure, and avatar upload validation.

### M8: Security, Quality, And Release Readiness

Goal: harden the migrated app and prepare the release switch.

Deliverables:

- Run a full XSS review for Markdown, streamed content, profile fields, query params, and upload metadata.
- Remove all remaining CJK text from source and in-repo docs unless an allowlisted i18n file is introduced.
- Verify all files follow kebab-case naming and responsibility boundaries.
- Add missing tests for migrated regressions found during manual QA.
- Document known gaps, release switch checklist, and rollback plan.
- Remove unused Vue-era assumptions from app code and scripts.

Acceptance criteria:

- Build, typecheck, lint, test, and format checks pass.
- No file exceeds the configured line-count ceiling.
- No `any`, non-null assertion, unsafe access, or trust-boundary payload without validation remains.
- Manual QA passes across the default provider matrix.
- Release switch and rollback steps are documented before switching traffic.

### M9: Payment Realtime Parity

Goal: close the payment behavior gap between the Vue socket flow and the React checkout flow.

Deliverables:

- Add a concrete browser socket adapter behind the existing `SocketLifecycle` boundary.
- Connect the adapter from app services without leaking provider-specific socket APIs into feature code.
- Keep `paymentSuccess` subscription and cleanup behavior equivalent to the legacy payment dialog.
- Add payment status polling through the existing `getPaymentStatus` endpoint when no socket event is received.
- Surface visible success, expired, cancelled, and failure states in the payment dialog.
- Add focused tests for socket connection, listener cleanup, polling success, polling timeout, and payment failure.

Acceptance criteria:

- A successful external payment refreshes owned courses without a page reload.
- Payment succeeds through either `paymentSuccess` or `TRADE_SUCCESS` status polling.
- Closing the dialog removes `paymentSuccess` listeners and stops polling.
- Payment creation, status polling, and socket payloads remain schema-validated.
- `pnpm --filter @ai-en/web lint`, `typecheck`, `test`, and `build` pass.

### M10: Learning Interaction Parity

Goal: restore the legacy spelling input ergonomics while keeping React routing provider-neutral.

Deliverables:

- Add auto-focus to the next spelling cell after a valid character input.
- Add Backspace behavior that clears the current cell and moves focus to the previous cell.
- Preserve validation colors and completion gating for correct and incorrect input.
- Replace direct `window.location.pathname` parsing with a provider-neutral route params adapter.
- Add tests for auto-focus, Backspace, invalid route params, and both router providers.

Acceptance criteria:

- Spelling input keyboard behavior matches the legacy Vue learning page.
- Learning route params are read through the selected router provider or a provider-neutral abstraction.
- Invalid learning params reject before fetching words.
- Word mastery submission still updates the auth session word count.
- `pnpm --filter @ai-en/web lint`, `typecheck`, `test`, and `build` pass.

### M11: Home Motion And Storybook Parity

Goal: complete the remaining visual parity work for the landing experience and UI documentation.

Deliverables:

- Use the React vocabulary marquee as the intentional replacement for the legacy Three.js hologram.
- Restore the legacy home motion class of behavior with GSAP-backed hero, intro, stat counter, and feature-card animations.
- Keep motion implementation reusable through `useHomeMotion` instead of page-level CSS selectors.
- Respect reduced-motion preferences and skip GSAP animation when the browser requests reduced motion.
- Add Storybook stories for Home, Auth, Chat, Courses, Learning, Word Book, and Settings feature-level components.
- Mock app services in Storybook stories so feature states can be reviewed without live APIs.
- Document any intentionally redesigned visual differences from the Vue app.

Acceptance criteria:

- The chosen home motion direction is documented as complete before release.
- Home motion has focused test coverage for GSAP activation and reduced-motion opt-out.
- Storybook covers shared states and at least one primary state for every migrated feature area.
- `pnpm --filter @ai-en/web storybook:build` passes.
- Feature stories use daisyUI tokens and avoid deprecated component-library assumptions.
- `pnpm --filter @ai-en/web lint`, `typecheck`, `test`, and `build` pass.

### M12: Release QA And Switch

Goal: complete manual parity QA and switch traffic from the Vue app to the React app with a rollback path.

Deliverables:

- Generate and execute the production manual QA checklist in `release-readiness.md` across the default provider setup.
- Run the required provider matrix for data, store, and router branches before release.
- Verify SPA navigation behavior for header, profile, home CTA, course learning, and navigation pill links.
- Validate production values for server, AI, upload, and socket base URLs.
- Validate payment success and failure against the production-like payment provider mode.
- Verify both `paymentSuccess` socket confirmation and payment status polling fallback in the production-like environment.
- Deploy the React artifact and switch the static hosting or entry route from `apps/web-old` to `apps/web`.
- Keep the rollback path to the last known good Vue artifact ready during the release window.

Acceptance criteria:

- Manual QA passes for Home, Auth, Chat, Courses, Learning, Word Book, and Settings.
- Navigation remains app-local across the release checklist and does not unexpectedly reload provider-managed routes.
- Payment order creation, checkout handoff, confirmation, expiration, and owned-course refresh pass before switching traffic.
- Default and required provider matrix checks pass.
- Release monitoring covers login failures, API validation errors, SSE failures, and payment creation failures.
- Rollback steps are verified before traffic switch.
- The React app replaces the Vue app only after QA sign-off.

## Delivery Order

- Phase 1: complete M0 through M2 before feature migration starts.
- Phase 2: complete M3 and M4 to unblock usable navigation and authentication.
- Phase 3: complete M5 through M7 by feature area, merging only after tests pass.
- Phase 4: complete M8 before replacing the legacy app.
- Phase 5: complete M9 and M10 to close functional parity gaps found after migration.
- Phase 6: M11 is complete; execute M12 to finish manual QA, provider-matrix checks, and traffic switch.

## Provider Test Matrix

- Required for every milestone: default configuration with `swr`, `zustand`, and `react-router`.
- Required before release: `tanstack` data provider with default store and router.
- Required before release: `jotai` store provider with default data and router.
- Required before release: `tanstack` router provider with default data and store.
- Optional stress pass: all TanStack-compatible providers together.

## Risks And Mitigations

- Provider branching can duplicate feature logic; keep branching inside adapters only.
- Legacy API typings may not match runtime responses; validate every response with schemas and add fixtures from observed payloads.
- Token refresh can create request loops; keep refresh requests isolated from authenticated clients.
- Streaming content can carry unsafe Markdown or HTML; sanitize all rendered AI content.
- Feature parity can regress during rewrite; track route-level parity and require focused tests per migrated feature.
- Payment confirmation can diverge between socket and polling flows; keep both behind schema-validated adapters and test listener cleanup.
- Provider-specific route params can leak into feature code; keep route params behind a provider-neutral adapter.
- Visual parity can copy legacy limitations too closely; keep the documented Three.js-to-marquee replacement and GSAP home motion tests as the release baseline.

## Open Questions

- Confirm the concrete browser socket transport and deployment URL for payment events.
- Confirm production values for server, AI, upload, and socket base URLs.
- Confirm whether the course payment flow redirects to an external provider or renders an in-app result.
- Confirm expected browser language for speech recognition after migration.
- Confirm coverage threshold targets for the React application.
