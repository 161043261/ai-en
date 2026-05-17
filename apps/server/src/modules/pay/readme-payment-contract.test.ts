import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

const readReadme = () => readFile(resolve("README.md"), "utf8");

describe("README payment contract", () => {
  test("documents the Alipay flag, checkout URL, status URL, and rollback", async () => {
    const readme = await readReadme();

    expect(readme).toContain("ALIPAY_ENABLED=true");
    expect(readme).toContain("ALIPAY_ENABLED=false");
    expect(readme).toContain("payUrl");
    expect(readme).toContain("statusUrl");
    expect(readme).toContain("Roll back Alipay checkout");
  });
});
