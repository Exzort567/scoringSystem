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

      const contestantId = String(contestant._id);
      const roundId = String(round._id);

      if (!contestantMap[contestantId]) {
        contestantMap[contestantId] = {
          _id: contestantId,
          number: contestant.number,
          name: contestant.name,
          category: contestant.category,
          photoUrl: contestant.photoUrl,
          roundScores: {} as Record<string, number>, // per round total
          totalScore: 0, // sum of all rounds
        };
      }

      // Sum judge scores for this round
      contestantMap[contestantId].roundScores[roundId] =
        (contestantMap[contestantId].roundScores[roundId] || 0) +
        (s.totalRoundScore || 0);
    });

    // Calculate totals for each contestant (sum of all rounds)
    Object.values(contestantMap).forEach((contestant: any) => {
      let total = 0;
      rounds.forEach((round: any) => {
        const roundId = String(round._id);
        total += contestant.roundScores[roundId] || 0;
      });
      contestant.totalScore = total;
    });

    // Create overall leaderboard
    const overall = Object.values(contestantMap).sort(
      (a: any, b: any) => b.totalScore - a.totalScore
    );

    // Split leaderboard by category
    const overallMr = overall.filter((c: any) => c.category === "Mr");
    const overallMiss = overall.filter((c: any) => c.category === "Ms");

    // Build per-round leaderboards
    const roundResults = rounds.map((round: any) => {
      const roundId = String(round._id);
      const results = Object.values(contestantMap)
        .map((c: any) => ({
          _id: c._id,
          number: c.number,
          name: c.name,
          category: c.category,
          photoUrl: c.photoUrl,
          score: c.roundScores[roundId] || 0,
        }))
        .sort((a, b) => b.score - a.score);
      return {
        _id: roundId,
        name: round.name,
        results,
      };
    });

    // ✅ Get Final Round explicitly
    const finalRound = rounds.find((r: any) =>
      r.name.toLowerCase().includes("final")
    );

    let mrTop5: any[] = [];
    let missTop5: any[] = [];

    if (finalRound) {
      const finalRoundId = String(finalRound._id);

      mrTop5 = Object.values(contestantMap)
        .filter((c: any) => c.category === "Mr")
        .map((c: any) => ({
          ...c,
          finalScore: c.roundScores[finalRoundId] || 0,
        }))
        .sort((a, b) => b.finalScore - a.finalScore)
        .slice(0, 5);

      missTop5 = Object.values(contestantMap)
        .filter((c: any) => c.category === "Ms")
        .map((c: any) => ({
          ...c,
          finalScore: c.roundScores[finalRoundId] || 0,
        }))
        .sort((a, b) => b.finalScore - a.finalScore)
        .slice(0, 5);
    }

    const finalists = { mrTop5, missTop5 };

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
