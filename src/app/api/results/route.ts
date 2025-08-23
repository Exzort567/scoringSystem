import { NextResponse } from "next/server";
import { connectDB } from "../../lib/mongodb";
import Score from "../../lib/models/Score";
import Contestant from "../../lib/models/Contestant";
import Round from "../../lib/models/Round";

export async function GET() {
  try {
    await connectDB();

    // Fetch all rounds
    const rounds = await Round.find().lean();

    // Fetch all scores with populated contestant and round
    const scores = await Score.find()
      .populate("contestantId")
      .populate("roundId")
      .lean();

    // Build contestant map
    const contestantMap: Record<string, any> = {};

    scores.forEach((s: any) => {
      const contestant = s.contestantId;
      const round = s.roundId;
      if (!contestant || !round) return;

      if (!contestantMap[contestant._id]) {
        contestantMap[contestant._id] = {
          _id: contestant._id,
          number: contestant.number,
          name: contestant.name,
          category: contestant.category,
          photoUrl: contestant.photoUrl,
          roundScores: {}, // per round total
          totalScore: 0,   // sum of all rounds
        };
      }

      // Sum judge scores for this round
      contestantMap[contestant._id].roundScores[round._id] =
        (contestantMap[contestant._id].roundScores[round._id] || 0) +
        (s.totalRoundScore || 0);
    });

    // Calculate totals for each contestant (sum, not weighted)
    Object.values(contestantMap).forEach((contestant: any) => {
      let total = 0;
      rounds.forEach((round: any) => {
        total += contestant.roundScores[round._id] || 0;
      });
      contestant.totalScore = total;
    });

    // Create overall leaderboard (sorted descending)
    const overall = Object.values(contestantMap).sort(
      (a: any, b: any) => b.totalScore - a.totalScore
    );

    // Split leaderboard by category
    const overallMr = overall.filter((c: any) => c.category === "Mr");
    const overallMiss = overall.filter((c: any) => c.category === "Miss");

    // Build per-round leaderboards
    const roundResults = rounds.map((round: any) => {
      const results = Object.values(contestantMap)
        .map((c: any) => ({
          _id: c._id,
          number: c.number,
          name: c.name,
          category: c.category,
          photoUrl: c.photoUrl,
          score: c.roundScores[round._id] || 0,
        }))
        .sort((a, b) => b.score - a.score);
      return {
        _id: round._id,
        name: round.name,
        results,
      };
    });

    // Get Top 5 for finals (per category)
    const finalists = {
      mrTop5: overallMr.slice(0, 5),
      missTop5: overallMiss.slice(0, 5),
    };

    return NextResponse.json({
      overall,
      overallMr,
      overallMiss,
      rounds: roundResults,
      finalists,
    });
  } catch (err: any) {
    console.error("Error fetching results:", err);
    return NextResponse.json(
      { error: "Failed to fetch results", details: err.message },
      { status: 500 }
    );
  }
}
