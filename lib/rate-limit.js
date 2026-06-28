// Simple in-memory rate limiter.
// NOT suitable for multi-instance deployments (use Redis/Upstash for production scale).

const store = new Map();

export function rateLimit({ windowMs = 60000, maxRequests = 10, key }) {
  const now = Date.now();
  const windowStart = now - windowMs;

  const record = store.get(key) || [];
  const requestsInWindow = record.filter((timestamp) => timestamp > windowStart);

  if (requestsInWindow.length >= maxRequests) {
    return { allowed: false, retryAfter: Math.ceil((record[0] + windowMs - now) / 1000) };
  }

  requestsInWindow.push(now);
  store.set(key, requestsInWindow);

  // Basic cleanup every ~100 entries to avoid unbounded growth
  if (store.size > 10000) {
    for (const [k, v] of store.entries()) {
      const filtered = v.filter((timestamp) => timestamp > windowStart);
      if (filtered.length === 0) store.delete(k);
      else store.set(k, filtered);
    }
  }

  return { allowed: true };
}

export function getClientKey(request) {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "anonymous";
  return ip;
}
