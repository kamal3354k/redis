const express = require("express");
// const Redis = require("redis");
const data = require("./data.js");
const Redis = require("ioredis");

const app = express();
app.use(express.json());
const redisClient = new Redis({
  host: "localhost",
  port: 6379,
});
const DEFAULT_EXPIRE = 10; //sec

app.get("/photos", (req, res) => {
  try {
    redisClient.get("photos", async (err, photos) => {
      if (err) return new Error(err);
      if (photos !== null) {
        res.json(JSON.parse(photos));
      } else {
        console.log("cache missed~~");
        setTimeout(async () => {
          await redisClient.setex(
            "photos",
            DEFAULT_EXPIRE,
            JSON.stringify(data)
          );
          res.json(data); // Parse the cached data before sending
        }, [200]);
      }
    });
  } catch (error) {
    console.error("An error occurred:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(8000, () => {
  console.log("Server is running on port 8000");
});
