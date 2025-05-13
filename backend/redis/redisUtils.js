import redis from "./redisConnection.js";

const getJSON = async (key) => {
  const data = await redis.get(key);
  if (!data) {
    return null;
  }
  return JSON.parse(data);
};

const cacheJSON = async (key, data, expireTime) => {
  try {
    data = JSON.stringify(data);
    if (expireTime) {
      await redis.set(key, data);
      await redis.expire(key, expireTime);
    } else {
      await redis.set(key, data);
    }
    console.log("Cached data for key " + key);
  } catch (e) {
    console.log(e);
  }
};

const unsetJSON = async (key) => {
  try {
    await redis.del(key);
    console.log("de-cached data for key " + key);
  } catch (e) {
    console.log(e);
  }
};

export default {
  cacheJSON,
  getJSON,
  unsetJSON,
};
