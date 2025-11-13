import Redis from 'ioredis';
import { EventEmitter } from 'node:events';
import { config } from '../config/env.js';

const bus = new EventEmitter();

let redis = null;
if (config.redisUrl) {
  redis = new Redis(config.redisUrl, {
    tls: config.redisUrl.startsWith('rediss://') ? {} : undefined,
    lazyConnect: true
  });
}

const memoryStore = new Map();

function serialize(value) {
  return JSON.stringify(value ?? null);
}

function deserialize(value) {
  if (value == null) return null;
  try {
    return JSON.parse(value);
  } catch (error) {
    return null;
  }
}

export async function kvGet(key, fallback = null) {
  if (redis) {
    const raw = await redis.get(key);
    const parsed = deserialize(raw);
    return parsed ?? fallback;
  }
  return memoryStore.has(key) ? memoryStore.get(key) : fallback;
}

export async function kvSet(key, value) {
  if (redis) {
    await redis.set(key, serialize(value));
  } else {
    memoryStore.set(key, value);
  }
  bus.emit('kv:set', { key, value });
  return value;
}

export async function kvDelete(key) {
  if (redis) {
    await redis.del(key);
  } else {
    memoryStore.delete(key);
  }
  bus.emit('kv:delete', { key });
}

export function kvOn(event, listener) {
  bus.on(event, listener);
  return () => bus.off(event, listener);
}
