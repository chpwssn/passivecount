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
  }
};

const app = express();

client = redis.createClient({ ...config.redis });

app.get("/", (req, res) => {
  client.incrby("count", 1, (e, r) => {
    if (e) {
      console.error(e);
      res.send("Oh hooray, the app is broken! ╮( ˘ ､ ˘ )╭");
    } else {
      res.send(`Oh hooray, you made the counter go up to ${r}! ╮( ˘ ､ ˘ )╭`);
    }
  });
});

app.get("/meta", (req, res) => {
  const stats = [`hostname: ${os.hostname()}`];
  res.send(
    [
      "Ooooooo I know how to find new paths and see meta data! pshaw.",
      ...stats
    ].join("<br/>")
  );
});

app.listen(config.express.port, () =>
  console.log(`Example app listening on port ${config.express.port}!`)
);
