import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { rateLimit, getClientKey } from "../lib/rate-limit.js";

describe("rateLimit (memory fallback)", () => {
  it("allows requests up to maxRequests", async () => {
    const key = "test:allowed";
    for (let i = 0; i < 3; i++) {
      const result = await rateLimit({ windowMs: 10000, maxRequests: 3, key });
      assert.equal(result.allowed, true);
    }
  });

  it("blocks requests beyond maxRequests", async () => {
    const key = "test:blocked";
    for (let i = 0; i < 3; i++) {
      await rateLimit({ windowMs: 10000, maxRequests: 3, key });
    }

    const result = await rateLimit({ windowMs: 10000, maxRequests: 3, key });
    assert.equal(result.allowed, false);
    assert.ok(typeof result.retryAfter === "number");
    assert.ok(result.retryAfter > 0);
  });

  it("tracks different keys independently", async () => {
    const resultA = await rateLimit({ windowMs: 10000, maxRequests: 1, key: "test:ip-a" });
    const resultB = await rateLimit({ windowMs: 10000, maxRequests: 1, key: "test:ip-b" });

    assert.equal(resultA.allowed, true);
    assert.equal(resultB.allowed, true);
  });
});

describe("getClientKey", () => {
  it("extracts the first IP from x-forwarded-for", () => {
    const request = {
      headers: new Map([
        ["x-forwarded-for", "203.0.113.1, 70.41.3.18"],
        ["x-real-ip", "10.0.0.1"],
      ]),
    };
    assert.equal(getClientKey(request), "203.0.113.1");
  });

  it("falls back to x-real-ip", () => {
    const request = {
      headers: new Map([
        ["x-forwarded-for", ""],
        ["x-real-ip", "10.0.0.1"],
      ]),
    };
    assert.equal(getClientKey(request), "10.0.0.1");
  });

  it("returns anonymous when no IP headers", () => {
    const request = { headers: new Map() };
    assert.equal(getClientKey(request), "anonymous");
  });
});
