import { NextResponse } from "next/server";
import Round from "../../../lib/models/Round";
import { connectDB } from "../../../lib/mongodb";

export async function POST() {
  await connectDB();
  await Round.updateMany({}, { $set: { isLocked: true } });
  return NextResponse.json({ success: true });
}
