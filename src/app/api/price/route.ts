import { NextRequest, NextResponse } from "next/server";
import { getPriceAtTimestamp } from "@/lib/services/priceService";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tokenAddress, network, timestamp } = body;

    if (!tokenAddress || !network || !timestamp) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await getPriceAtTimestamp(tokenAddress, network, timestamp);
    return NextResponse.json(result);
  } catch (err) {
    console.error("Error in /api/price:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
