import { NextResponse } from "next/server";
import { connectDB } from "../../lib/mongodb";
import Score from "../../lib/models/Score";
import Round from "../../lib/models/Round";
import Contestant from "../../lib/models/Contestant";

export async function GET() {
  try {
    await connectDB();

    // Preliminary rounds
    const prelimNames = [
      "Production Number",
      "Sports Attire",
      "Q&A",
      "Formal Attire",
    ];
    const prelimRounds = await Round.find({ name: { $in: prelimNames } })
      .select("_id name")
      .lean();
    const prelimIds = prelimRounds.map((r: any) => r._id);

    // Scores for prelim rounds
    const allScores = await Score.find({ roundId: { $in: prelimIds } })
      .select("contestantId totalRoundScore")
      .lean();

    // Sum totals per contestant
    const totals = new Map<string, number>();
    for (const s of allScores) {
      const key = String(s.contestantId);
      totals.set(key, (totals.get(key) || 0) + (s.totalRoundScore || 0));
    }

    // Load contestants with category field
    const contestants = await Contestant.find({})
      .select("_id name number barangay photoUrl category")
      .lean();

    // Merge totals + contestant info
    const merged = contestants.map((c: any) => ({
      ...c,
      total: totals.get(String(c._id)) || 0,
    }));

    // Split into categories
    // Split into categories
    const mr = merged.filter((c) => c.category === "Mr");
    const miss = merged.filter((c) => c.category === "Ms");


    console.log("Merged contestants:", merged);

    // Sort + slice top5 each
    const mrTop5 = mr.sort((a, b) => b.total - a.total).slice(0, 5);
    const missTop5 = miss.sort((a, b) => b.total - a.total).slice(0, 5);
    console.log("Merged Contestants:", merged.map(c => ({
      name: c.name,
      category: c.category
    })));
 
    return NextResponse.json({ mrTop5, missTop5 });
  } catch (err: any) {
    console.error("Top5 error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}


