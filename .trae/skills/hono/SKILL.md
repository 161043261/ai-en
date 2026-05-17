---
name: hono
description: Expert guidance for building, modifying, reviewing, testing, and debugging Hono.js applications across Cloudflare Workers, Node.js, Bun, Deno, Vercel, AWS Lambda, and other Web Standards runtimes. Use this skill whenever the user mentions Hono, Hono.js, `hono`, Hono middleware, Hono RPC, Hono Client, `hc`, `app.route`, `app.request`, Hono validation, Hono testing, Hono OpenAPI, edge APIs, Workers APIs, or migrating Express-style server code to Hono, even if the request only asks for a route, middleware, API handler, or deployment entry point.
---

# Hono.js Skill

Use this skill to deliver production-quality Hono.js solutions grounded in the bundled Hono documentation and examples. Hono is a small, fast, Web Standards-based TypeScript framework that runs across edge, serverless, and JavaScript runtime environments.

## Core Objectives

When this skill is active:

- Produce idiomatic Hono code that preserves TypeScript inference and runtime portability.
- Prefer Web Standards primitives such as `Request`, `Response`, `Headers`, `FormData`, and Fetch-compatible handlers.
- Match the target runtime before choosing entry points, adapters, static file handling, WebSocket helpers, or deployment commands.
- Use Hono's built-in routing, middleware, validation, helpers, and testing APIs before introducing heavier abstractions.
- Consult the bundled documentation and examples when the task involves specific APIs, middleware, runtime setup, or integrations.

## Reference Map

The bundled resources are organized into documentation and examples:

- General overview: `docs/index.md`
- Basic project setup and first routes: `docs/getting-started/basic.md`
- Runtime-specific setup: `docs/getting-started/`
- Main app API: `docs/api/hono.md`
- Routing details: `docs/api/routing.md`
- Context and request APIs: `docs/api/context.md`, `docs/api/request.md`
- Best practices: `docs/guides/best-practices.md`
- Middleware guidance: `docs/concepts/middleware.md`, `docs/guides/middleware.md`, `docs/middleware/`
- Validation: `docs/guides/validation.md`
- RPC and Hono Client: `docs/guides/rpc.md`
- Testing: `docs/guides/testing.md`, `docs/helpers/testing.md`
- Helpers: `docs/helpers/`
- Practical examples: `examples/`
- OpenAPI examples: `examples/zod-openapi.md`, `examples/hono-openapi.md`, `examples/swagger-ui.md`, `examples/scalar.md`
- Authentication examples: `examples/better-auth.md`, `examples/hono-authjs.md`, `examples/stytch-auth.md`
- Cloudflare examples: `examples/cloudflare-durable-objects.md`, `examples/cloudflare-queue.md`, `examples/cloudflare-vitest.md`
- Proxy and integration examples: `examples/proxy.md`, `examples/behind-reverse-proxy.md`, `examples/stripe-webhook.md`, `examples/prisma.md`

Read the smallest relevant set of files. Do not load the entire documentation tree unless the user asks for a broad survey.

## Working Process

1. Identify the user's target runtime, package manager, project structure, and TypeScript setup.
2. Inspect existing code before editing. Look for `package.json`, runtime config files, existing Hono app entry points, middleware, route modules, tests, and deployment files.
3. Choose the relevant documentation or example files from the Reference Map.
4. Implement the smallest coherent change that fits the existing architecture.
5. Validate behavior with project-appropriate checks, such as type checking, unit tests, runtime-specific tests, or focused `app.request()` tests.
6. Explain any runtime-specific assumptions, new dependencies, or follow-up deployment steps.

## Idiomatic Hono Patterns

### Basic App

Use `Hono` as the primary application object:

```ts
import { Hono } from "hono";

const app = new Hono();

app.get("/", (c) => c.text("Hello Hono!"));

export default app;
```

The final export can vary by runtime. For Cloudflare Workers and Bun, `export default app` is often sufficient. For other runtimes, check the matching file in `docs/getting-started/`.

### Route Handlers

Keep handlers close to route definitions whenever practical:

```ts
app.get("/books/:id", (c) => {
  const id = c.req.param("id");
  return c.json({ id });
});
```

This preserves path parameter inference. Avoid extracting Rails-style controllers unless there is a clear reason. If extraction is needed, use `createFactory()` from `hono/factory` to retain type inference.

### Larger Applications

For larger applications, split route modules and mount them with `app.route()`:

```ts
import { Hono } from "hono";
import authors from "./authors";
import books from "./books";

const app = new Hono();

app.route("/authors", authors);
app.route("/books", books);

export default app;
```

For RPC-oriented applications, prefer chained route definitions and export `typeof app` or `typeof route` as `AppType`.

### Validation

Use Hono validators for request data and prefer mature schema libraries when useful:

```ts
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

app.post(
  "/posts",
  zValidator(
    "json",
    z.object({
      title: z.string(),
      body: z.string(),
    }),
  ),
  (c) => {
    const data = c.req.valid("json");
    return c.json({ ok: true, post: data }, 201);
  },
);
```

Remember these validation details:

- JSON and form validation require the matching `Content-Type` header.
- Header validation keys should be lowercase.
- Multiple validators can be composed for `param`, `query`, `json`, `form`, `header`, and `cookie`.

### Middleware

Use `app.use()` for cross-cutting behavior and path-scoped middleware:

```ts
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";

app.use(logger());
app.use(secureHeaders());
```

For custom middleware, call `await next()` exactly when downstream handlers should run, and use `c.set()` and `c.get()` with typed `Variables` when sharing request-scoped data.

### Error Handling

Use `app.notFound()` for custom 404 responses and `app.onError()` for uncaught errors:

```ts
app.notFound((c) => c.json({ error: "Not Found" }, 404));

app.onError((err, c) => {
  console.error(err);
  return c.json({ error: "Internal Server Error" }, 500);
});
```

When building an RPC client, avoid `c.notFound()` for typed API responses because it does not infer well through the client. Return explicit typed JSON responses with status codes instead.

### RPC and Hono Client

Use `hc` when the user needs a type-safe client:

```ts
import type { AppType } from "./server";
import { hc } from "hono/client";

const client = hc<AppType>("http://localhost:8787/");
```

For reliable RPC typing:

- Export `AppType` from the route or app that contains the typed handlers.
- Use validators so request inputs are inferred.
- Return `c.json()` with explicit status codes when response unions matter.
- Ensure `"strict": true` is set in relevant TypeScript configurations, especially in monorepos.

### Testing

Use `app.request()` for focused endpoint tests:

```ts
test("POST /posts", async () => {
  const res = await app.request("/posts", {
    method: "POST",
    body: JSON.stringify({ title: "Hello" }),
    headers: new Headers({ "Content-Type": "application/json" }),
  });

  expect(res.status).toBe(201);
  expect(await res.json()).toEqual({ ok: true });
});
```

For runtime-specific testing, consult the matching runtime guide and `examples/cloudflare-vitest.md` when Cloudflare Workers are involved.

## Runtime Guidance

Choose runtime-specific docs before changing entry points or deployment configuration:

- Cloudflare Workers: `docs/getting-started/cloudflare-workers.md`
- Cloudflare Pages: `docs/getting-started/cloudflare-pages.md`
- Node.js: `docs/getting-started/nodejs.md`
- Bun: `docs/getting-started/bun.md`
- Deno: `docs/getting-started/deno.md`
- Vercel: `docs/getting-started/vercel.md`
- AWS Lambda: `docs/getting-started/aws-lambda.md`
- Lambda@Edge: `docs/getting-started/lambda-edge.md`
- Google Cloud Run: `docs/getting-started/google-cloud-run.md`
- Netlify: `docs/getting-started/netlify.md`
- Fastly Compute: `docs/getting-started/fastly.md`
- Azure Functions: `docs/getting-started/azure-functions.md`

Do not assume that helpers for static files, WebSockets, environment bindings, or request context are portable across runtimes. Check the relevant adapter documentation first.

## Integration Guidance

Use examples as implementation references:

- For OpenAPI or generated API docs, read `examples/zod-openapi.md`, `examples/hono-openapi.md`, `examples/swagger-ui.md`, or `examples/scalar.md`.
- For authentication, read the relevant example before wiring routes, cookies, sessions, or trusted origins.
- For database work, align route handlers with the project's existing ORM or database client, and use `examples/prisma.md` if Prisma is involved.
- For webhooks, preserve raw body and signature verification requirements; consult `examples/stripe-webhook.md` for Stripe-style patterns.
- For reverse proxies, proxy routes, headers, and forwarded information, consult `examples/proxy.md` and `examples/behind-reverse-proxy.md`.
- For file upload and multipart handling, consult `examples/file-upload.md` and the request body documentation.

## Code Quality Checklist

Before finishing a Hono task, verify that:

- The route methods, paths, and status codes match the requested API contract.
- Request parsing uses the correct source: `param`, `query`, `json`, `form`, `header`, or `cookie`.
- JSON or form tests include the appropriate `Content-Type` header.
- Type inference is preserved for route params, validated inputs, `c.env`, and `c.var`.
- Middleware order is intentional and path scoping is explicit.
- Errors and not-found behavior are handled at the correct application level.
- Runtime-specific entry points and adapters match the deployment target.
- New dependencies are justified and match the project's package manager.
- Tests or manual verification cover the changed behavior.

## Response Style

When answering Hono questions:

- Be precise about runtime assumptions.
- Prefer complete, minimal TypeScript examples over pseudocode.
- Mention the exact documentation or example file used when it matters.
- Explain tradeoffs briefly when choosing between direct handlers, route modules, middleware, helpers, or external packages.
- Avoid recommending Express-style patterns unless the user is migrating and needs an incremental path.
