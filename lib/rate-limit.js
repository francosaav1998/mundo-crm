// Rate limiter with Upstash Redis support and in-memory fallback.
// Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN to use Redis.

import { Redis } from "@upstash/redis";

const store = new Map();

function createRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  try {
    return new Redis({ url, token });
  } catch {
    return null;
  }
}

async function memoryRateLimit({ windowMs, maxRequests, key }) {
  const now = Date.now();
  const windowStart = now - windowMs;

  const record = store.get(key) || [];
  const requestsInWindow = record.filter((timestamp) => timestamp > windowStart);

  if (requestsInWindow.length >= maxRequests) {
    return { allowed: false, retryAfter: Math.ceil((record[0] + windowMs - now) / 1000) };
  }

  requestsInWindow.push(now);
  store.set(key, requestsInWindow);

  if (store.size > 10000) {
    for (const [k, v] of store.entries()) {
      const filtered = v.filter((timestamp) => timestamp > windowStart);
      if (filtered.length === 0) store.delete(k);
      else store.set(k, filtered);
    }
  }

  return { allowed: true };
}

async function redisRateLimit({ windowMs, maxRequests, key }) {
  const redis = createRedis();
  if (!redis) return memoryRateLimit({ windowMs, maxRequests, key });

  const now = Date.now();
  const windowStart = now - windowMs;
  const redisKey = `ratelimit:${key}`;

  try {
    await redis.zremrangebyscore(redisKey, 0, windowStart);
    const count = await redis.zcard(redisKey);

    if (count >= maxRequests) {
      const oldest = await redis.zrange(redisKey, 0, 0, { withScores: true });
      const oldestScore = oldest?.[0]?.score || windowStart;
      return { allowed: false, retryAfter: Math.ceil((oldestScore + windowMs - now) / 1000) };
    }

    await redis.zadd(redisKey, { score: now, member: `${now}-${Math.random().toString(36).slice(2)}` });
    await redis.expire(redisKey, Math.ceil(windowMs / 1000));

    return { allowed: true };
  } catch {
    return memoryRateLimit({ windowMs, maxRequests, key });
  }
}

export async function rateLimit({ windowMs = 60000, maxRequests = 10, key }) {
  return redisRateLimit({ windowMs, maxRequests, key });
}

export function getClientKey(request) {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "anonymous";
  return ip;
}
