let redisClient = null;
let redisAvailable = false;

async function initRedis() {
  console.log("=================================");
  console.log("REDIS_URL:", process.env.REDIS_URL);
  console.log("REDIS_HOST:", process.env.REDIS_HOST);
  console.log("REDIS_PORT:", process.env.REDIS_PORT);
  console.log("=================================");

  console.log("ℹ️ Redis disabled completely");
  redisClient = null;
  redisAvailable = false;

  return;
}

async function cacheGet() {
  return null;
}

async function cacheSet() {
  return;
}

async function cacheDel() {
  return;
}

module.exports = {
  initRedis,
  cacheGet,
  cacheSet,
  cacheDel,
};