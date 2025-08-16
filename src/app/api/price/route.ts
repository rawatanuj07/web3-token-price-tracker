import { NextRequest, NextResponse } from "next/server";
import { getPriceAtTimestamp } from "@/lib/services/priceService";
import { getTokenBirthdate } from "@/lib/services/tokenBirthBlock";

export async function POST(req: NextRequest) {
  // In your Next.js API route _only_ (NOT in client!)
  const originalFetch = global.fetch;
  global.fetch = (url, options) => {
    if (options?.referrer === "client") {
      delete options.referrer;
    }
    return originalFetch(url, options);
  };

  // console.log("data coming from frotnend", req);
  try {
    const { tokenAddress, network, timestamp } = await req.json();
    console.log("data coming from frotnend", timestamp);
    if (!tokenAddress || !network || !timestamp) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }


    // Verifying birth date of token
    const dateObj = new Date(timestamp);
    const birthDate = await getTokenBirthdate(tokenAddress);
    // Log birth date in IST
    console.log(
      'Token birth date (IST):',
      birthDate.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
    );
    if (birthDate instanceof Date && dateObj < birthDate) {
      return NextResponse.json({
        error: `Token did not exist at ${dateObj.toISOString()}. Earliest data starts from ${birthDate.toISOString()}.`
      }, { status: 400 });
    }



    // Getting price or interpolated value
    const result = await getPriceAtTimestamp(tokenAddress, network, timestamp, );
    console.log("result from api", result)

  // Return price + birthDate
  return NextResponse.json({
    ...result,
    birthDate: birthDate.toISOString(), // send as ISO string
  });

  } catch (err) {
    console.error("Error in /api/price:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
