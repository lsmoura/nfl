const fetch = require('node-fetch');
const redis = require('redis');

let initialized = false;
let client = null;

const getClient = () => {
  if (initialized) return client;

  initialized = true;
  client = (process.env.USE_REDIS && process.env.USE_REDIS !== '0' && process.env.USE_REDIS !== 'false')
    ? redis.createClient()
    : null;

  return client;
}

const cacheGet = (key, expire = 0) => {
  if (!getClient()) return Promise.resolve(null);

  return new Promise((accept, reject) => {
    getClient().get(key, (err, response) => {
      if (err) {
        reject(err);
        return;
      }

      try {
        const contents = JSON.parse(response);
        if (!contents.data || !contents.time) {
          accept(null);
        } else {
          accept(contents.data);
        }
      } catch (err) {
        console.warn('error parsing redis cached response');
        accept(null);
        return;
      }
    });
  });
};

const cacheSet = (key, data) => {
  if (!getClient()) return Promise.resolve(null);

  return new Promise((accept, reject) => {
    const contents = {
      data: data,
      time: new Date(),
    };
    getClient().set(key, JSON.stringify(contents), accept);
  });
};

const cacheDel = async (key) => {
  if (!getClient()) return null;

  getClient().del(key);

  return true;
};

const fetcher = async (url, ...args) => {
  const cachedValue = await cacheGet(url);
  if (cachedValue !== null) return cachedValue;

  const response = await fetch(url, ...args);
  const text = await response.text();

  await cacheSet(url, text);

  return text;
};

const cache = {
  set: cacheSet,
  get: cacheGet,
  del: cacheDel,
};

module.exports = fetcher;
module.exports.cache = cache;
module.exports.disconnect = () => {
  initialized = false;
  if (client) {
    client.quit();
    client = null;
  }
};
