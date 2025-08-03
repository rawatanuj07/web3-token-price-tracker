import redis from "@/lib/utils/redis";
import {
  fetchExactPrice,
  fetchNearestPrices,
} from "@/lib/services/alchemyService";
import { interpolate } from "@/lib/services/interpolationService";

export async function getPriceAtTimestamp(
  token: string,
  network: string,
  timestamp: number
) {
  const key = `${token}-${network}-${timestamp}`;
  const cached = await redis.get(key);
  if (cached) {
    return { price: parseFloat(cached), source: "cache" };
  }

  const directPrice = await fetchExactPrice(token, network, timestamp);
  if (directPrice !== null) {
    await redis.set(key, directPrice, "EX", 300);
    return { price: directPrice, source: "alchemy" };
  }

  const { before, after } = await fetchNearestPrices(token, network, timestamp);
  const interpolated = interpolate(timestamp, before, after);
  await redis.set(key, interpolated, "EX", 300);
  return { price: interpolated, source: "interpolated" };
}
