import app from "./app.js";
import { getEnv } from "./config/env.js";
import { connectDatabase, disconnectDatabase } from "./config/database.js";

const env = getEnv();

async function start(): Promise<void> {
  await connectDatabase();

  const server = app.listen(env.PORT, () => {
    console.log(`API server running on port ${env.PORT}`);
  });

  const shutdown = async (): Promise<void> => {
    console.log("\nShutting down...");
    server.close();
    await disconnectDatabase();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
