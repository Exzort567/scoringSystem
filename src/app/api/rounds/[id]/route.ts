import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "../../../lib/mongodb";
import Round from "../../../lib/models/Round";

// PATCH update round (lock/unlock)
export async function PATCH(req: NextRequest, context: { params: { id: string } }) {
  await connectDB();
  const { id } = context.params;
  const body = await req.json();
  const round = await Round.findByIdAndUpdate(id, body, { new: true });
  return NextResponse.json(round);
}

// DELETE round
export async function DELETE(req: NextRequest, context: { params: { id: string } }) {
  await connectDB();
  const { id } = context.params;
  await Round.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
