/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import { Collection } from "mongodb";

function loadEnvValue(key: string) {
  const envPath = path.resolve(__dirname, "..", ".env");
  const content = fs.readFileSync(envPath, "utf8");
  const line = content
    .split(/\r?\n/)
    .find((entry) => entry.startsWith(`${key}=`));
  if (!line) {
    throw new Error(`Missing ${key} in .env`);
  }
  return line.substring(key.length + 1).trim();
}

function readJson(fileName: string) {
  const filePath = path.resolve(__dirname, "sample-data", fileName);
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

async function upsertById(collection: Collection, docs: Record<string, unknown>[]) {
  if (!docs.length) return;
  await (collection.bulkWrite as any)(
    docs.map((doc) => ({
      replaceOne: {
        filter: { _id: doc._id },
        replacement: doc,
        upsert: true,
      },
    }))
  );
}

async function upsertEscortProfiles(collection: Collection, docs: Record<string, unknown>[]) {
  if (!docs.length) return;
  await (collection.bulkWrite as any)(
    docs.map((doc) => ({
      replaceOne: {
        filter: { userId: doc.userId },
        replacement: doc,
        upsert: true,
      },
    }))
  );
}

async function upsertSubscriptions(collection: Collection, docs: Record<string, unknown>[]) {
  if (!docs.length) return;
  await (collection.bulkWrite as any)(
    docs.map((doc) => ({
      replaceOne: {
        filter: { userId: doc.userId, planId: doc.planId },
        replacement: doc,
        upsert: true,
      },
    }))
  );
}

async function run() {
  const mongoUri = loadEnvValue("MONGODB_URI");
  await mongoose.connect(mongoUri, {
    maxPoolSize: 5,
    serverSelectionTimeoutMS: 30000,
  });

  const users = readJson("users.json");
  const plans = readJson("plans.json");
  const escortProfiles = readJson("escort-profiles.json");
  const subscriptions = readJson("subscriptions.json");

  const db = mongoose.connection.db;
  if (!db) {
    throw new Error("Database connection not established");
  }
  await upsertById(db.collection("users"), users);
  await upsertById(db.collection("plans"), plans);
  await upsertEscortProfiles(db.collection("escortprofiles"), escortProfiles);
  await upsertSubscriptions(db.collection("subscriptions"), subscriptions);

  await mongoose.disconnect();
}

run().catch((error) => {
  console.error("Seed failed:", error.message);
  process.exitCode = 1;
});
