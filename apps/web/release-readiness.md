# Web Release Readiness

## Scope

This checklist covers the React 19 migration in `apps/web` before replacing the legacy Vue 3 app in `apps/web-old`.

## Required Verification

- Run `pnpm --filter @ai-en/web lint`.
- Run `pnpm --filter @ai-en/web typecheck`.
- Run `pnpm --filter @ai-en/web test`.
- Run `pnpm --filter @ai-en/web build`.
- Run `pnpm --filter @ai-en/web storybook:build` when UI stories change.

## Provider Matrix

- Default: `SWR_PROVIDER=swr`, `STORE_PROVIDER=zustand`, `ROUTER_PROVIDER=react-router`.
- Data branch: `SWR_PROVIDER=tanstack`, `STORE_PROVIDER=zustand`, `ROUTER_PROVIDER=react-router`.
- Store branch: `SWR_PROVIDER=swr`, `STORE_PROVIDER=jotai`, `ROUTER_PROVIDER=react-router`.
- Router branch: `SWR_PROVIDER=swr`, `STORE_PROVIDER=zustand`, `ROUTER_PROVIDER=tanstack`.

## Manual QA

- Home: vocabulary marquee, GSAP landing motion, stat counters, course entry, and auth dialog work.
- Auth: login, register, persisted session, logout, and refresh failure handling work.
- Chat: role selection, history load, streaming response, stream error UI, and speech input guards work.
- Courses: catalog load, owned courses, payment creation, payment failure, and payment success listener work.
- Learning: route params validate, words load, spelling progresses, and mastered words update the session.
- Word book: search, selected filters, pagination, pronunciation, and safe translation rendering work.
- Settings: profile save, invalid email, avatar validation, upload failure, reminder settings, and logout work.

## Production Manual QA

### Entry Criteria

- [ ] Deploy the React artifact built from `apps/web/dist` to a production-like target.
- [ ] Set `VITE_SERVER_API_BASE_URL`, `VITE_AI_API_BASE_URL`, and `VITE_SOCKET_BASE_URL` to production-like endpoints.
- [ ] Confirm the payment provider is in production-like mode and can return success, pending, expired, and failed states.
- [ ] Prepare one unpaid test account, one paid test account, and one account with existing word-book data.
- [ ] Open browser DevTools with network preservation enabled before starting payment and navigation checks.

### Payment

- [ ] Sign in with the unpaid test account and open `/courses/index`.
- [ ] Confirm the course catalog loads without schema validation errors or unexpected empty states.
- [ ] Open a paid course purchase dialog and verify course name, teacher, image, and amount match the catalog card.
- [ ] Click `Create order` and verify a single `/pay/create` request is sent with `courseId`, `subject`, `body`, and `totalAmount`.
- [ ] Confirm the checkout page opens in a new tab or window without replacing the React app tab.
- [ ] Confirm the payment dialog shows `Waiting for payment` and starts the countdown from the server `timeExpire`.
- [ ] Complete payment in the provider page and return to the React app tab.
- [ ] Verify `paymentSuccess` socket confirmation marks the dialog successful and refreshes owned courses without a full page reload.
- [ ] Disable or block the socket connection, create another order, complete payment, and verify `/pay/status/:outTradeNo` polling confirms success.
- [ ] Leave one order unpaid until the countdown ends and verify the dialog shows the expired state and allows creating a new order.
- [ ] Simulate or select a failed payment provider result and verify the dialog keeps the user on the app and shows a recoverable error.
- [ ] Close the dialog during a pending payment and verify no duplicate `paymentSuccess` listener or polling request continues after close.
- [ ] Reopen the dialog after close and verify it starts with a clean state: no stale success, error, countdown, or order number.
- [ ] After success, confirm the purchased course appears in the owned course view and the learning entry is available.
- [ ] Refresh the browser and confirm the paid state persists from the server, not only from local UI state.
- [ ] Confirm payment errors are visible to the user and do not expose raw stack traces, tokens, or provider secrets.

### SPA Navigation

- [ ] Start at `/` and click the header logo; verify the app stays on `/` and does not reload the document.
- [ ] From the signed-out home page, click `Start learning`; verify the auth dialog opens without route replacement.
- [ ] From the signed-in home page, click `Continue practice`; verify navigation reaches `/chat/index`.
- [ ] Click `View courses`; verify navigation reaches `/courses/index`.
- [ ] Use the main navigation pill links for Home, Chat, Courses, Word Book, and Settings.
- [ ] Verify every navigation updates the URL, active navigation state, and page heading without losing the auth session.
- [ ] Open profile actions and click the settings entry; verify navigation reaches `/setting/index`.
- [ ] From an owned course card, click `Start learning`; verify navigation reaches `/courses/learn/:courseId/:title`.
- [ ] Verify learning route params are decoded correctly for course titles containing spaces or URL-encoded characters.
- [ ] Directly paste each production route into the address bar and verify the React app renders the intended route.
- [ ] Use browser Back and Forward across Home, Courses, Learning, Chat, Word Book, and Settings.
- [ ] Verify Back and Forward preserve route state enough to continue without blank pages or router errors.
- [ ] Hard-refresh every route and verify static hosting fallback returns the React app shell.
- [ ] Confirm no navigation sends users to legacy Vue routes or `apps/web-old` assets.
- [ ] Confirm no route change clears local auth persistence unless logout or refresh failure is expected.

### Provider Matrix

- [ ] Run default QA with `SWR_PROVIDER=swr`, `STORE_PROVIDER=zustand`, and `ROUTER_PROVIDER=react-router`.
- [ ] Run the data branch smoke pass with `SWR_PROVIDER=tanstack`.
- [ ] Run the store branch smoke pass with `STORE_PROVIDER=jotai`.
- [ ] Run the router branch smoke pass with `ROUTER_PROVIDER=tanstack`.
- [ ] In each branch, verify login, route reachability, course load, payment dialog open, learning route validation, and logout.

### Release Monitoring

- [ ] Monitor login failures, token refresh failures, API validation errors, payment creation failures, socket connection failures, and polling failures.
- [ ] Confirm frontend error messages are user-safe and backend logs include enough identifiers to trace payment orders.
- [ ] Confirm CDN or static-host logs show the React artifact serving all supported routes.
- [ ] Keep the Vue artifact and rollback target available until the first production monitoring window is complete.

### Sign-Off

- [ ] Product signs off Home, Auth, Chat, Courses, Learning, Word Book, and Settings parity.
- [ ] Engineering signs off payment confirmation through both socket and polling paths.
- [ ] QA signs off SPA navigation and hard-refresh fallback for all production routes.
- [ ] Release owner signs off rollback readiness before switching traffic.

## Visual Parity Decision

- Home uses the React vocabulary marquee as the intentional replacement for the legacy Three.js hologram.
- Home restores the legacy GSAP motion class of behavior with hero, intro, stat counter, and scroll-triggered feature-card animations.
- Reduced-motion users keep a stable non-animated experience, and release QA should verify both motion and reduced-motion paths.

## Release Switch

- Deploy the React app artifact from `apps/web/dist`.
- Point the web entry route or static hosting target from the legacy Vue artifact to the React artifact.
- Keep the server API base URL, AI API base URL, and socket base URL unchanged unless the environment file explicitly documents a target change.
- Monitor login failures, API validation errors, SSE failures, and payment creation failures for the first release window.

## Rollback

- Restore the static hosting target to the last known good `apps/web-old` artifact.
- Keep server deployments unchanged unless the release included server changes.
- Clear CDN or edge cache for the app shell if users continue receiving the React artifact.
- Re-run the default provider verification before attempting another switch.

## Known Gaps

- Payment confirmation now supports both the browser socket adapter and status polling; production-like provider QA is still required.
- SPA navigation should be verified across header, profile, course, and home links before traffic switch.
- Storybook covers shared states and primary feature component states; deeper edge-state stories can be added as UI stabilizes.
- Provider branch tests cover route reachability, but full end-to-end manual QA is still required for release.
