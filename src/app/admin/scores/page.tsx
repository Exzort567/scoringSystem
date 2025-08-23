"use client";
import { useEffect, useState } from "react";
import { ably } from "../../lib/ably";

export default function ScoresPage() {
  const [scores, setScores] = useState<any[]>([]);
  const [top5, setTop5] = useState<{ mrTop5: any[]; missTop5: any[] }>({
    mrTop5: [],
    missTop5: [],
  });
  const [loading, setLoading] = useState(true);
  const [selectedRound, setSelectedRound] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<"All" | "Mr" | "Ms">("All");

  useEffect(() => {
    async function fetchData() {
      try {
        const [scoresRes, top5Res] = await Promise.all([
          fetch("/api/scores"),
          fetch("/api/top5"),
        ]);
        const scoresData = await scoresRes.json();
        const top5Data = await top5Res.json();

        setScores(scoresData);
        setTop5(top5Data);

        if (scoresData.length > 0) {
          setSelectedRound(scoresData[0].roundId?.name);
        }
      } catch (err) {
        console.error("Error fetching scores/top5:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();

    const channel = ably.channels.get("scores");
    const handler = () => fetchData();
    channel.subscribe("newScore", handler);

    return () => channel.unsubscribe("newScore", handler);
  }, []);

  if (loading) return <p className="p-6">Loading...</p>;

  const rounds = [...new Set(scores.map((s) => s.roundId?.name))];
  let filteredScores = scores.filter((s) => s.roundId?.name === selectedRound);

  if (categoryFilter !== "All" && selectedRound !== "Final Round (Top 5)") {
    filteredScores = filteredScores.filter(
      (s) => s.contestantId?.category?.toLowerCase() === categoryFilter.toLowerCase()
    );
  }

  return (
    <div className="p-6 space-y-10">
      <h1 className="text-2xl font-bold text-emerald-700">Scores</h1>
      <p className="text-gray-600 mb-4">Live monitoring of judge submissions.</p>

      {/* Round Tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {rounds.map((round) => (
          <button
            key={round}
            onClick={() => setSelectedRound(round)}
            className={`px-4 py-2 rounded-lg border ${
              selectedRound === round
                ? "bg-emerald-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {round}
          </button>
        ))}
      </div>

      {/* Category Filter (hide for Top 5) */}
      {selectedRound !== "Final Round (Top 5)" && (
        <div className="flex gap-2 mb-6">
          {["All", "Mr", "Ms"].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat as "All" | "Mr" | "Ms")}
              className={`px-4 py-2 rounded-lg border ${
                categoryFilter === cat
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {cat === "Ms" ? "Miss" : cat}
            </button>
          ))}
        </div>
      )}

      {/* Top 5 Special Case */}
      {selectedRound === "Final Round (Top 5)" ? (
        <div className="grid md:grid-cols-2 gap-6">
          {["Mr", "Ms"].map((cat) => {
            const top5Ids =
              cat === "Mr"
                ? top5.mrTop5.map((c) => String(c._id))
                : top5.missTop5.map((c) => String(c._id));

            const catScores = filteredScores.filter(
              (s) =>
                s.contestantId?.category === cat &&
                top5Ids.includes(String(s.contestantId?._id))
            );

            return (
              <section key={cat}>
                <h2 className="text-xl font-bold text-emerald-700 mb-2">
                  {cat === "Ms" ? "Miss" : cat} Top 5
                </h2>
                <ScoreTable scores={catScores} />
              </section>
            );
          })}
        </div>
      ) : (
        <section>
          <h2 className="text-xl font-bold text-emerald-700 mb-2">{selectedRound}</h2>
          <ScoreTable scores={filteredScores} />
        </section>
      )}
    </div>
  );
}

function ScoreTable({ scores }: { scores: any[] }) {
  return (
    <table className="w-full border border-gray-300 text-sm">
      <thead className="bg-gray-100">
        <tr>
          <th className="border p-2">Contestant</th>
          <th className="border p-2">Judge</th>
          <th className="border p-2">Criteria</th>
          <th className="border p-2">Total</th>
          <th className="border p-2">Notes</th>
        </tr>
      </thead>
      <tbody>
        {scores.map((s) => (
          <tr key={s._id}>
            <td className="border p-2 flex items-center gap-2">
              <img
                src={s.contestantId?.photoUrl || "/images/avatar.png"}
                alt={s.contestantId?.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              {s.contestantId?.number}. {s.contestantId?.name}
            </td>
            <td className="border p-2">{s.judgeId?.name}</td>
            <td className="border p-2">
              {s.criteriaScores.map((c: any) => (
                <div key={c.name}>
                  {c.name}: {c.rawScore}
                </div>
              ))}
            </td>
            <td className="border p-2">{s.totalRoundScore}</td>
            <td className="border p-2 text-gray-700">
              {s.notes || <span className="italic text-gray-400">No notes</span>}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
