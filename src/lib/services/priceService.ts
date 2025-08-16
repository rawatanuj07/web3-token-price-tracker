// src/lib/services/priceService.ts
import axios from "axios";
import { redis, getMongoClient } from "../clients";
interface Candle {
  timestamp: string;
  value: string;
}

/**
 * Linearly interpolate price between two timestamps.
 * @param ts_q - target timestamp (seconds)
 * @param ts_before - timestamp before target (seconds)
 * @param price_before - price at ts_before
 * @param ts_after - timestamp after target (seconds)
 * @param price_after - price at ts_after
 * @returns interpolated price
 */
function interpolate(
  ts_q: number,
  ts_before: number,
  price_before: number,
  ts_after: number,
  price_after: number
) {
  const ratio = (ts_q - ts_before) / (ts_after - ts_before);
  return price_before + (price_after - price_before) * ratio;
}

/**
 * Fetch the price of a token at a specific timestamp.
 * Checks cache first, then queries Alchemy historical price API.
 * Falls back to interpolation if exact price data is unavailable.
 * @param token - token contract address
 * @param network - blockchain network (ethereum, polygon, arbitrum, optimism, bnb)
 * @param timestamp - target timestamp (string or number)
 * @returns { price: number, source: string }
 */
export async function getPriceAtTimestamp(
  token: string,
  network: string,
  timestamp: string | number
) {

  // Generate a unique cache key for Redis
  const cacheKey = `${token}:${network}:${timestamp}`;

  // Try fetching price from Redis cache
  const cached = await redis.get<number>(cacheKey);
  console.log("coming from cache", cached);
  if (cached) return { price: cached, source: "redis-cache" };

  // Map common network names to Alchemy network identifiers
  const networkMap: Record<string, string> = {
    ethereum: "eth-mainnet",
    polygon: "polygon-mainnet",
    arbitrum: "arb-mainnet",
    optimism: "opt-mainnet",
    bnb: "bsc-mainnet",
  };
  // const alchemyNetwork = networkMap[network] || network;
  const alchemyNetwork = networkMap[network.toLowerCase()];
  if (!alchemyNetwork) throw new Error(`Unsupported network: ${network}`);
  const apiKey = process.env.ALCHEMY_API_KEY;
  if (!apiKey) throw new Error("Missing ALCHEMY_API_KEY");

  // Alchemy Historical Price API endpoint
  const apiUrl = `https://api.g.alchemy.com/prices/v1/${apiKey}/tokens/historical`;

  // Normalize the input timestamp to a JavaScript Date object
  const dateObj =
    typeof timestamp === "string" && isNaN(Number(timestamp))
      ? new Date(timestamp)
      : new Date(Number(timestamp) * 1000);

  // Calculate the start and end of the requested day in UTC
  const startOfDay = new Date(Date.UTC(dateObj.getUTCFullYear(), dateObj.getUTCMonth(), dateObj.getUTCDate(), 0, 0, 0));
  const endOfDay = new Date(Date.UTC(dateObj.getUTCFullYear(), dateObj.getUTCMonth(), dateObj.getUTCDate(), 23, 59, 59));

  const startISO = startOfDay.toISOString();
  const endISO = endOfDay.toISOString();

  console.log("Requesting price for:", token, network);
  console.log("Start:", startISO, "End:", endISO);

  try {
    // Fetch historical price candles from Alchemy
    console.log("Try Starting getPriceAtTimestamp");
    const res = await axios.post(apiUrl, {
      network: alchemyNetwork,
      address: token,
      startTime: startISO,
      endTime: endISO,
      interval: "5m",
    });

    let finalPrice: number;
    let source: string;
    console.log("direct price data", res);

    // Check if Alchemy returned valid data
    if (res.data?.data && res.data.data.length > 0) {
      const candles = res.data.data;

      // Convert target timestamp to seconds for comparison
      const ts_q = Math.floor(dateObj.getTime() / 1000);

      let before: Candle | null= null; // Candle just before or equal to ts_q
      let after: Candle | null= null;  // Candle just after or equal to ts_q

      // Loop through candles to find before and after
      for (const c of candles) {
        const ts_c = Math.floor(new Date(c.timestamp).getTime() / 1000);
        if (ts_c <= ts_q) {
          before = c;
        }
        if (ts_c >= ts_q) {
          after = c;
          break;
        }
      }

      if (before && after) {
        if (before.timestamp === after.timestamp) {
          finalPrice = parseFloat(before.value);
          source = "alchemy-exact";
        } else {
          // only interpolate if timestamp is between two candles
          finalPrice = interpolate(
            ts_q,
            Math.floor(new Date(before.timestamp).getTime() / 1000),
            parseFloat(before.value),
            Math.floor(new Date(after.timestamp).getTime() / 1000),
            parseFloat(after.value)
          );
          source = "alchemy-interpolated";
        }
      }  else if (before) {
        finalPrice = parseFloat(before.value);
        source = "alchemy-nearest-before";
      } else if (after) {
        finalPrice = parseFloat(after.value);
        source = "alchemy-nearest-after";
      } else {
        throw new Error("No suitable candles found");
      }
    } else {
      throw new Error("Unexpected Alchemy response format");
    }

    // Cache the price in Redis for 5 minutes
    await redis.set(cacheKey, finalPrice, { ex: 300 });

    // Persist price data in MongoDB
    const mongo = await getMongoClient();
    await mongo.db("pricesDB").collection("prices").insertOne({
      token,
      network,
      timestamp,
      price: finalPrice,
      source,
    });

    return { price: finalPrice, source };
  } catch (err) {
    console.error("Alchemy API error:", err);

    // Optional fallback: interpolate between previous and next day's price
    try {
      const beforeDate = new Date(startOfDay.getTime() - 86400000); // 1 day before
      const afterDate = new Date(startOfDay.getTime() + 86400000);  // 1 day after

      const beforeRes = await axios.post(apiUrl, {
        network: alchemyNetwork,
        address: token,
        startTime: beforeDate.toISOString(),
        endTime: beforeDate.toISOString(),
        interval: "1d",
      });

      const afterRes = await axios.post(apiUrl, {
        network: alchemyNetwork,
        address: token,
        startTime: afterDate.toISOString(),
        endTime: afterDate.toISOString(),
        interval: "1d",
      });

      const beforePrice = parseFloat(beforeRes.data?.data?.[0]?.value || "0");
      const afterPrice = parseFloat(afterRes.data?.data?.[0]?.value || "0");

      if (beforePrice && afterPrice) {
        const finalPrice = interpolate(
          Math.floor(dateObj.getTime() / 1000),
          Math.floor(beforeDate.getTime() / 1000),
          beforePrice,
          Math.floor(afterDate.getTime() / 1000),
          afterPrice
        );

        // Cache fallback price
        await redis.set(cacheKey, finalPrice, { ex: 300 });
        return { price: finalPrice, source: "interpolated" };
      }
    } catch (fallbackErr) {
      console.error("Interpolation fallback failed:", fallbackErr);
    }

    throw new Error("Failed to fetch price from Alchemy");
  }
}
