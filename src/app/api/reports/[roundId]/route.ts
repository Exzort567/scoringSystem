import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/mongodb";
import Score from "../../../lib/models/Score";
import User from "../../../lib/models/Users";
import Contestant from "../../../lib/models/Contestant";
import Round from "../../../lib/models/Round";

export async function GET(_: Request, context: { params: Promise<{ roundId: string }> }) {
  try {
    await connectDB();
    const { roundId } = await context.params; // ✅ await params

    // Get round info
    const round = await Round.findById(roundId);
    if (!round) {
      return NextResponse.json({ message: "Round not found" }, { status: 404 });
    }

    // Get scores for this round, including judge and contestant data
    const scores = await Score.find({ roundId })
      .populate("contestantId", "name gender barangay number")
      .populate("judgeId", "name email")
      .lean();

    return NextResponse.json({
      roundName: round.name,
      date: new Date().toLocaleString(),
      scores,
    });
  } catch (error) {
    console.error("Error fetching report:", error);
    return NextResponse.json({ message: "Error generating report" }, { status: 500 });
  }
}
