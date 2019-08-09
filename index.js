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
  redisChannel: {
    human: "events",
    count: "newCounts"
  },
  socketIoChannel: {
    human: "event"
  },
  countKey: process.env.COUNT_KEY || "count",
  metricCountKey: process.env.COUNT_KEY || "metric-count"
};

const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

const homepage = count => `
<!doctype html>
<html>
  <head>
    <title>passive count</title>
    <script src="/socket.io/socket.io.js"></script>
    <style>
    body, html {
        height: 100%
    }
    .app-ish {
        min-height: 90%
    }
    .small {
        font-size: 8pt;
    }
    </style>
    <script>
        var socket = io();
        socket.on('${config.socketIoChannel.human}', function(msg){
            const count = msg.replace(/^[^;]+;/, "")
            document.getElementById("count").innerHTML = count
            document.getElementById("lead").innerHTML = "Someone else has made the counter"
            msg = msg.replace(/;/, ' just made the count ')
            document.getElementById("message").innerHTML = msg
            setTimeout(() => {
                let element = document.getElementById("message")
                if(element.innerHTML == msg)
                    document.getElementById("message").innerHTML = ""
            }, 5000)
        });
    </script>
  </head>
  <body>
    <div class="app-ish">
        <span id="lead">Oh hooray, you made the counter go up to</span> <span id="count">${count}</span>! ╮( ˘ ､ ˘ )╭
        <p id="message"></p>
    </div>
    <span class="small"><a href="https://github.com/chpwssn/passivecount">this app was a test of something else that happens to be a fun minigame</a></span>
  </body>
</html>
`;

const client = redis.createClient({ ...config.redis });

const emit = (message, newCount) => {
  client.publish(config.redisChannel.human, `${message};${newCount}`);
  client.publish(config.redisChannel.count, newCount);
};

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
    emit("human", r);
    if (e) {
      console.error(e);
      res.send("Oh hooray, the app is broken! ╮( ˘ ､ ˘ )╭");
    } else {
      res.send(homepage(r));
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
  emit("robot", count);
  res.json({
    count,
    snark: "error: `impressed` is not a valid state of this API"
  });
});

const sub = redis.createClient(config.redis);
sub.subscribe(config.redisChannel.human);

io.on("connection", function(socket) {
  sub.on("message", (channel, msg) => {
    socket.emit(config.socketIoChannel.human, msg);
  });
});

http.listen(config.express.port, () =>
  console.log(`Example app listening on port ${config.express.port}!`)
);
