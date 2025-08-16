import { Redis } from "@upstash/redis";
import { MongoClient } from "mongodb";

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

let mongoClient: MongoClient | null = null;
let mongoClientPromise: Promise<MongoClient> | null = null;

  export async function getMongoClient() {
    if (mongoClient) return mongoClient;
  
    if (!mongoClientPromise) {
      mongoClient = new MongoClient(process.env.MONGODB_URI!);
      mongoClientPromise = mongoClient.connect();
    }
  
    mongoClient = await mongoClientPromise;
    return mongoClient;
  }