let redisClient = null;
let redisAvailable = false;

async function initRedis() {
  if (!process.env.REDIS_URL && !process.env.REDIS_HOST) {
    console.log("ℹ️  Redis not configured — caching disabled");
    return;
  }

  try {
    const { createClient } = require("redis");
    const url =
      process.env.REDIS_URL ||
      `redis://${process.env.REDIS_HOST || "localhost"}:${process.env.REDIS_PORT || 6379}`;

    redisClient = createClient({ url });
    redisClient.on("error", (err) => console.warn("Redis error:", err.message));
    await redisClient.connect();
    redisAvailable = true;
    console.log("✅ Redis connected");
  } catch (err) {
    console.warn("⚠️  Redis unavailable:", err.message);
    redisClient = null;
    redisAvailable = false;
  }
}

async function cacheGet(key) {
  if (!redisAvailable || !redisClient) return null;
  try {
    const val = await redisClient.get(key);
    return val ? JSON.parse(val) : null;
  } catch {
    return null;
  }
}

async function cacheSet(key, value, ttlSeconds = 300) {
  if (!redisAvailable || !redisClient) return;
  try {
    await redisClient.setEx(key, ttlSeconds, JSON.stringify(value));
  } catch {
    /* ignore cache write failures */
  }
}

async function cacheDel(pattern) {
  if (!redisAvailable || !redisClient) return;
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length) await redisClient.del(keys);
  } catch {
    /* ignore */
  }
}

module.exports = { initRedis, cacheGet, cacheSet, cacheDel };
