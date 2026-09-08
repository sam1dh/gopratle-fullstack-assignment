import mongoose from "mongoose";
import { getEnv } from "./env.js";

let isConnected = false;

export async function connectDatabase(): Promise<void> {
  if (isConnected) return;

  const env = getEnv();
  await mongoose.connect(env.MONGODB_URI);
  isConnected = true;
  console.log("Connected to MongoDB");
}

export async function disconnectDatabase(): Promise<void> {
  if (!isConnected) return;
  await mongoose.disconnect();
  isConnected = false;
  console.log("Disconnected from MongoDB");
}

export function isDatabaseConnected(): boolean {
  return isConnected;
}
