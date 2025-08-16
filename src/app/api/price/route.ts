import { NextRequest, NextResponse } from "next/server";
import { getPriceAtTimestamp } from "@/lib/services/priceService";

export async function POST(req: NextRequest) {
  // console.log("data coming from frotnend", req);
  try {
    const { tokenAddress, network, timestamp } = await req.json();
  console.log("data coming from frotnend", timestamp);
  if (!tokenAddress || !network || !timestamp) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    const unixTimestamp = Math.floor(new Date(timestamp).getTime() / 1000);
    const result = await getPriceAtTimestamp(tokenAddress, network, timestamp);
console.log("result from api", result)
    
    return NextResponse.json(result);

  } catch (err) {
    console.error("Error in /api/price:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
