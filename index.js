const os = require("os");
const redis = require("redis");

const express = require("express");

const config = {
  message: process.env.MESSAGE || null,
  express: {
    port: process.env.PORT || 3000
  },
  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: process.env.REDIS_PORT || 6379,
    db: process.env.REDIS_DB || 0
  },
  countKey: process.env.COUNT_KEY || "count",
  metricCountKey: process.env.COUNT_KEY || "metric-count"
};

const app = express();

client = redis.createClient({ ...config.redis });

const getAsync = async (client, name) => {
  return new Promise((resolve, reject) => {
    client.get(name, (e, r) => {
      if (e) reject(e);
      resolve(r);
    });
  });
};

const incrbyAsync = async (client, name, count) => {
  return new Promise((resolve, reject) => {
    client.incrby(name, count, (e, r) => {
      if (e) reject(e);
      resolve(r);
    });
  });
};

app.get("/", (req, res) => {
  client.incrby(config.countKey, 1, (e, r) => {
    if (e) {
      console.error(e);
      res.send("Oh hooray, the app is broken! ╮( ˘ ､ ˘ )╭");
    } else {
      res.send(`Oh hooray, you made the counter go up to ${r}! ╮( ˘ ､ ˘ )╭`);
    }
  });
});

app.get("/meta", (req, res) => {
  const stats = [`hostname: ${os.hostname()}`, `domain: ${req.hostname}`];
  res.send(
    [
      "Ooooooo I know how to find new paths and see meta data! pshaw.",
      ...stats
    ].join("<br/>")
  );
});

app.get("/metrics", async (req, res) => {
  const count = await getAsync(client, config.countKey);
  const metricCount = await incrbyAsync(client, config.metricCountKey, 1);
  const metrics = [`count ${count}`, `metricCount ${metricCount}`];
  res.setHeader("content-type", "text/plain");
  res.send(
    [
      "# oh well beep boop, look at mister bigshot robot over here, scraping metrics!",
      ...metrics
    ].join("\n")
  );
});

app.get("/json", async (req, res) => {
  const count = await incrbyAsync(client, config.countKey, 1);
  res.json({
    count,
    snark: "error: `impressed` is not a valid state of this API"
  });
});

app.listen(config.express.port, () =>
  console.log(`Example app listening on port ${config.express.port}!`)
);
