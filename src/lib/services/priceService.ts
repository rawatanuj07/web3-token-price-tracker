// src/lib/services/priceService.ts
import axios from "axios";
import { redis, getMongoClient } from "../clients";

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

export async function getPriceAtTimestamp(
  token: string,
  network: string,
  timestamp: string | number
) {

  const cacheKey = `${token}:${network}:${timestamp}`;

  const cached = await redis.get<number>(cacheKey);
  console.log("coming from cache", cached)
  if (cached) return { price: cached, source: "cache" };

  const networkMap: Record<string, string> = {
    ethereum: "eth-mainnet",
    polygon: "polygon-mainnet",
    arbitrum: "arb-mainnet",
    optimism: "opt-mainnet",
    bnb: "bsc-mainnet",
  };
  const alchemyNetwork = networkMap[network] || network;

  const apiKey = process.env.ALCHEMY_API_KEY;
  if (!apiKey) throw new Error("Missing ALCHEMY_API_KEY");

  const apiUrl = `https://api.g.alchemy.com/prices/v1/${apiKey}/tokens/historical`;

  // Normalize input timestamp
  const dateObj =
    typeof timestamp === "string" && isNaN(Number(timestamp))
      ? new Date(timestamp)
      : new Date(Number(timestamp) * 1000);

  const startOfDay = new Date(Date.UTC(dateObj.getUTCFullYear(), dateObj.getUTCMonth(), dateObj.getUTCDate(), 0, 0, 0));
  const endOfDay = new Date(Date.UTC(dateObj.getUTCFullYear(), dateObj.getUTCMonth(), dateObj.getUTCDate(), 23, 59, 59));

  const startISO = startOfDay.toISOString();
  const endISO = endOfDay.toISOString();

  console.log("Requesting price for:", token, network);
  console.log("Start:", startISO, "End:", endISO);

  try {
    console.log("Try Starting getPriceAtTimestamp"); // at the very top of the function

    const res = await axios.post(apiUrl, {
      network: alchemyNetwork,
      address: token,
      startTime: startISO,
      endTime: endISO,
      interval: "5m",
    });

    let finalPrice: number;
    let source: string;
    console.log("direct price data", res)
    if (res.data?.data && res.data.data.length > 0) {
      const priceData = res.data.data[0]?.value;
      if (priceData) {
        console.log("price found un alchemyAPi", priceData)
        finalPrice = parseFloat(priceData);
        console.log("price found un alchemyAPi", priceData)

        source = "alchemy";
      } else {
        throw new Error("No price data found in response");
      }
    } else {
      throw new Error("Unexpected Alchemy response format");
    }

    await redis.set(cacheKey, finalPrice, { ex: 300 });
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

    // Optional fallback: interpolation between prev and next day
    try {
      const beforeDate = new Date(startOfDay.getTime() - 86400000);
      const afterDate = new Date(startOfDay.getTime() + 86400000);

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

        await redis.set(cacheKey, finalPrice, { ex: 300 });
        return { price: finalPrice, source: "interpolated" };
      }
    } catch (fallbackErr) {
      console.error("Interpolation fallback failed:", fallbackErr);
    }

    throw new Error("Failed to fetch price from Alchemy");
  }
}
