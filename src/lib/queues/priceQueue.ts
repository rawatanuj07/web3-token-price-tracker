// /lib/queues/priceQueue.ts
import { Queue, Worker, Job } from "bullmq";
import IORedis from "ioredis";
import { getPriceAtTimestamp } from "../services/priceService";
import pLimit from "p-limit";
import pRetry from "p-retry";

const connection = new IORedis(process.env.UPSTASH_REDIS_TCP_URL!, {
  password: process.env.UPSTASH_REDIS_TCP_TOKEN,
  maxRetriesPerRequest: null,
});

export const priceQueue = new Queue("priceQueue", { connection });

export const priceWorker = new Worker(
  "priceQueue",
  async (job: Job) => {
    const { token, network, timestamps } = job.data; // array of ISO timestamps

    const limit = pLimit(1); // limit concurrent API calls to 3

    await Promise.all(
      timestamps.map((timestamp: string | number) =>
        limit(() =>
          pRetry(
            async () => {
              const result = await getPriceAtTimestamp(token, network, timestamp);

              // Throw if result is invalid to trigger retry
              if (!result || result.price === undefined) {
                throw new Error("Price fetch returned invalid data");
              }

              return result;
            },
            {
              retries: 5,
              factor: 2,
              minTimeout: 3000,  // 1s
              maxTimeout: 15000, // 10s
              onFailedAttempt: (err) => {
                console.log(
                  `Timestamp ${timestamp} attempt ${err.attemptNumber} failed. ${err.retriesLeft} retries left. Error: ${err.message}`
                );
              },
            }
          )
        )
      )
    );
  },
  {
    connection,
    concurrency: 1, // only one job at a time to avoid burst
  }
);
