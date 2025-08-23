import { NextResponse } from "next/server";
import { connectDB } from "../../lib/mongodb";
import Score from "../../lib/models/Score";
import Round from "../../lib/models/Round";

/**
 * GET all scores (with contestant, judge, and round details)
 */
export async function GET() {
  await connectDB();

  const scores = await Score.find({})
    .populate("contestantId", "name photoUrl number category") // contestant details
    .populate("judgeId", "name") // judge name
    .populate("roundId", "name"); // round name

  return NextResponse.json(scores);
}

/**
 * POST: Save scores for a round (handles weighted rounds and Top 5 raw scoring)
 */
export async function POST(req: Request) {
  try {
    await connectDB();
    const { roundId, scores, judgeId, notes } = await req.json();

    // Fetch round info (get criteria + weights)
    const round = await Round.findById(roundId);
    if (!round) {
      return NextResponse.json({ error: "Round not found" }, { status: 404 });
    }

    const results: any[] = [];

    // For each contestant
    for (const contestantId of Object.keys(scores)) {
      const contestantScores = scores[contestantId]; // { "Criterion": 8, ... }

      const criteriaScores = round.criteria.map((criterion: any) => {
        let raw = contestantScores?.[criterion.name] ?? 0;

        // ✅ Validate raw input
        if (typeof raw !== "number" || isNaN(raw)) raw = 0;
        if (raw < 1) raw = 1;

        // ✅ Determine max score for each criterion
        // Default to 10, but adjust if weight = 5 or name contains "Showmanship"
        let maxScore = 10;
        if (criterion.weight === 5 || criterion.name.toLowerCase().includes("showmanship")) {
          maxScore = 5;
          if (raw > 5) raw = 5; // cap at 5 for these
        } else if (raw > 10) {
          raw = 10; // cap at 10 for the rest
        }

        // ✅ Calculate weighted score based on percentage weight
        let weighted = raw;
        if (criterion.weight && criterion.weight > 0) {
          weighted = (raw / maxScore) * criterion.weight;
        }

        return {
          name: criterion.name,
          rawScore: raw,
          weight: criterion.weight ?? 10, // fallback for Top 5 rounds
          weightedScore: weighted,
        };
      });

      // ✅ Total round score (sum of weighted scores)
      const totalRoundScore = criteriaScores.reduce(
        (sum: number, c: any) => sum + c.weightedScore,
        0
      );

      // ✅ Prepare payload for DB
      const updateData: any = {
        roundId,
        contestantId,
        judgeId,
        criteriaScores,
        totalRoundScore,
        isSubmitted: true,
      };

      // ✅ Add notes if Final Round
      if (round.name === "Final Round (Top 5)" && notes) {
        updateData.notes = notes?.[contestantId]?.__common || "";
      }

      // ✅ Upsert to DB (update if already exists)
      const scoreDoc = await Score.findOneAndUpdate(
        { roundId, contestantId, judgeId },
        updateData,
        { upsert: true, new: true }
      );

      results.push(scoreDoc);
    }

    return NextResponse.json({ success: true, results }, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/scores error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
