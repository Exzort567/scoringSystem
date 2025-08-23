"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ably } from "../../lib/ably";

export default function ResultsPage() {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"rounds" | "finals">("finals");

  useEffect(() => {
    async function fetchResults() {
      try {
        const res = await fetch("/api/results");
        const data = await res.json();
        setResults(data);
      } catch (err) {
        console.error("Error fetching results:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchResults();

    const channel = ably.channels.get("scores");
    const handler = () => fetchResults();
    channel.subscribe("newScore", handler);

    return () => channel.unsubscribe("newScore", handler);
  }, []);

  if (loading) return <p className="p-6 text-gray-600">Loading results...</p>;

  // ✅ Winners from Final Round only
  const mrFinalists = results?.finalists?.mrTop5 || [];
  const msFinalists = results?.finalists?.missTop5 || [];

  const mrChampion = mrFinalists.length > 0 ? mrFinalists[0] : null;
  const msChampion = msFinalists.length > 0 ? msFinalists[0] : null;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-emerald-700">Pageant Results</h1>
      <p className="text-gray-500">Final rankings and breakdown by rounds</p>

      {/* Winner Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[{ label: "Mr Winner", winner: mrChampion }, { label: "Ms Winner", winner: msChampion }].map(({ label, winner }) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white shadow-xl rounded-2xl p-6 flex flex-col items-center"
          >
            <h2 className="text-xl font-bold text-emerald-600 mb-3">{label}</h2>
            {winner ? (
              <>
                <img
                  src={winner.photoUrl}
                  alt={winner.name}
                  className="w-48 h-48 rounded-2xl object-cover shadow-lg mb-4"
                />
                <p className="text-lg font-semibold">{winner.name}</p>
                <p className="text-gray-600">
                  Final Round Score:{" "}
                  <span className="font-bold">
                    {winner.finalScore?.toFixed(2)}
                  </span>
                </p>
              </>
            ) : (
              <p className="text-gray-500">No winner yet</p>
            )}
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-3 border-b mb-4">
        {["rounds", "finals"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-2 rounded-t-lg capitalize ${
              activeTab === tab
                ? "bg-emerald-600 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl shadow p-6">
        {activeTab === "rounds" && (
          <>
            <h2 className="text-xl font-semibold text-emerald-700 mb-4">
              Per Round Results
            </h2>
            {results?.rounds?.map((round: any) => (
              <div key={round._id} className="mb-6">
                <h3 className="text-lg font-bold text-gray-700 mb-2">
                  {round.name} ({round.weight || 0}%)
                </h3>
                <table className="w-full border border-gray-200 text-sm mb-4">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-2 border">Rank</th>
                      <th className="p-2 border">Contestant</th>
                      <th className="p-2 border">Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {round.results.map((r: any, idx: number) => (
                      <tr key={r._id}>
                        <td className="p-2 border">{idx + 1}</td>
                        <td className="p-2 border flex items-center gap-2">
                          <img
                            src={r.photoUrl || "/images/avatar.png"}
                            alt={r.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          {r.number}. {r.name}
                        </td>
                        <td className="p-2 border font-semibold">
                          {r.score.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </>
        )}

        {activeTab === "finals" && (
          <>
            <h2 className="text-xl font-semibold text-emerald-700 mb-4">
              Finalists (Top 5)
            </h2>
            {results?.finalists ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {["mrTop5", "missTop5"].map((key) => (
                  <div key={key}>
                    <h3 className="text-lg font-bold text-gray-700 mb-2">
                      {key === "mrTop5" ? "Mr Finalists" : "Ms Finalists"}
                    </h3>
                    {results.finalists[key].length > 0 ? (
                      <ul className="space-y-3">
                        {results.finalists[key].map((f: any, idx: number) => (
                          <li
                            key={f._id}
                            className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                          >
                            <div className="flex items-center gap-2">
                              <img
                                src={f.photoUrl || "/images/avatar.png"}
                                alt={f.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                              <span className="font-medium">
                                {f.number}. {f.name}
                              </span>
                            </div>
                            <span className="text-emerald-600 font-bold">
                              {f.finalScore?.toFixed(2)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500">No finalists yet</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Finalists not yet determined.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
