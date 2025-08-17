import { NextRequest, NextResponse } from "next/server";
import { priceQueue } from "@/lib/queues/priceQueue";
import { getTokenBirthdate } from "@/lib/services/tokenBirthBlock";

export async function POST(req: NextRequest) {
  const { tokenAddress, network } = await req.json();
  const token = tokenAddress;
  console.log("Token:", token, "Network:", network);
  if (!token) throw new Error("Token is undefined");
  if (!network) throw new Error("Network is undefined");
  // 1️⃣ Get token birthdate
  let startDate: Date;
  try {
    startDate = await getTokenBirthdate(token);
  } catch (err) {
    console.error("Could not get token birthdate:", err);
    return NextResponse.json({ error: "Failed to get token birthdate" }, { status: 500 });
  }

  // 2️⃣ Generate timestamps, 1 per day from birthdate to today
  const timestamps: string[] = [];
  const today = new Date();
  let current = new Date(startDate);

  while (current <= today) {
    timestamps.push(current.toISOString());
    current.setDate(current.getDate() + 1); // next day
  }

  // 3️⃣ Add job to queue
  await priceQueue.add("fetch-prices", { token, network, timestamps });

  return NextResponse.json({ message: `Scheduled ${timestamps.length} prices from ${startDate.toDateString()} to today.` });
}
