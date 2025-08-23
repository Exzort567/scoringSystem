import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/mongodb";
import Round from "../../../lib/models/Round";

// PATCH update round (lock/unlock)
export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await context.params; // ✅ await params
  const body = await req.json();
  const round = await Round.findByIdAndUpdate(id, body, { new: true });
  return NextResponse.json(round);
}

// DELETE round
export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await context.params; // ✅ await params
  await Round.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
