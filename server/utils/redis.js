import { createClient } from "redis";

const pubClient = createClient({
  url: process.env.REDIS_URL,
  socket: {
    tls: process.env.NODE_ENV == "production",
    rejectUnauthorized: false,
  },
});
const subClient = pubClient.duplicate();

pubClient.on("error", (err) => console.error("Redis Error:", err));

export const connectRedis = async () => {
  await Promise.all([pubClient.connect(), subClient.connect()]);
  console.log("Redis connected");
};

export { pubClient, subClient };
