import Redis from 'ioredis';

// Simple KV wrapper: prefers Redis, falls back to in-memory Map for dev.
const url = process.env.KV_REDIS_URL || process.env.REDIS_URL || process.env.UPSTASH_REDIS_REST_URL;
let redis = null;
if (url) {
  redis = new Redis(url, {
    tls: url.startsWith('rediss://') ? {} : undefined,
    lazyConnect: true
  });
}

const mem = new Map();

export async function kvGet(key) {
  if (redis) {
    const v = await redis.get(key);
    return v ? JSON.parse(v) : null;
  }
  return mem.has(key) ? mem.get(key) : null;
}

export async function kvSet(key, val) {
  if (redis) {
    await redis.set(key, JSON.stringify(val));
    return;
  }
  mem.set(key, val);
}

export async function kvDel(key) {
  if (redis) {
    await redis.del(key);
    return;
  }
  mem.delete(key);
}
