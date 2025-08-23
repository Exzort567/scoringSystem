import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/mongodb";
import Score from "../../../lib/models/Score";
import Round from "../../../lib/models/Round";

interface ContestantLean {
  _id: string;
  name: string;
  number: number;
  barangay: string;
  category: "Mr" | "Ms";
  photoUrl?: string;
}

interface ScoreLean {
  contestantId: ContestantLean;
  totalRoundScore: number;
}

export async function GET() {
  try {
    await connectDB();

    // Find the "Final Round (Top 5)" round
    const finalRound = await Round.findOne({ name: "Final Round (Top 5)" })
      .select("_id name")
      .lean<{ _id: string; name: string }>();

    if (!finalRound) {
      return NextResponse.json(
        { message: "Final Round not found" },
        { status: 404 }
      );
    }

    // Get all scores for the final round
    const scores = await Score.find({ roundId: finalRound._id })
      .populate<{ contestantId: ContestantLean }>(
        "contestantId",
        "name number barangay category photoUrl"
      )
      .lean<ScoreLean[]>();

    // Aggregate totals per contestant
    type Acc = Record<
      string,
      {
        _id: string;
        name: string;
        number: number;
        barangay: string;
        category: "Mr" | "Ms";
        photoUrl?: string;
        finalScore: number;
      }
    >;

    const acc: Acc = {};
    for (const s of scores) {
      const c = s.contestantId;
      if (!c?._id) continue;

      const key = String(c._id);
      if (!acc[key]) {
        acc[key] = {
          _id: key,
          name: c.name,
          number: c.number,
          barangay: c.barangay,
          photoUrl: c.photoUrl,
          category: c.category,
          finalScore: 0,
        };
      }
      acc[key].finalScore += Number(s.totalRoundScore || 0);
    }

    const merged = Object.values(acc);

    // Split, sort, and slice top 5
    const mrTop5 = merged
      .filter((c) => c.category === "Mr")
      .sort((a, b) => b.finalScore - a.finalScore)
      .slice(0, 5);

    const missTop5 = merged
      .filter((c) => c.category === "Ms")
      .sort((a, b) => b.finalScore - a.finalScore)
      .slice(0, 5);

    return NextResponse.json({ mrTop5, missTop5 });
  } catch (err) {
    console.error("Finals report error:", err);
    return NextResponse.json(
      { message: "Error building finals report" },
      { status: 500 }
    );
  }
}
