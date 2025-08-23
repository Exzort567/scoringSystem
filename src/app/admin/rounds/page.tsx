"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { Lock, Unlock } from "lucide-react";
import { ably } from "../../lib/ably";

interface Criterion {
  name: string;
  weight: number;
}

interface Round {
  _id: string;
  name: string;
  criteria: Criterion[];
  weight: number;
  isLocked: boolean;
}

export default function RoundsPage() {
  const [rounds, setRounds] = useState<Round[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch rounds
  const fetchRounds = async () => {
    const res = await axios.get("/api/rounds");
    setRounds(res.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchRounds();

    const channel = ably.channels.get("rounds");

    // Subscribe to changes
    channel.subscribe("roundChange", () => {
      fetchRounds();
    });

    return () => {
      channel.unsubscribe("roundChange");
    };

  }, []);

  const toggleLock = async (id: string, currentState: boolean) => {
    if (currentState === true) {
      await axios.post("/api/rounds/lockAll");
      await axios.patch(`/api/rounds/${id}`, { isLocked: false });
    } else {
      await axios.patch(`/api/rounds/${id}`, { isLocked: true });
    }

    // Notify others
    ably.channels.get("rounds").publish("roundChange", { roundId: id });
    fetchRounds();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-emerald-700">Rounds</h1>
      <p className="text-gray-600 mb-4">
        Manage and control competition rounds
      </p>
      {loading ? (
        <p>Loading rounds...</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {rounds.map((round) => (
            <div key={round._id} className="bg-white p-4 rounded-xl shadow">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-emerald-700">
                  {round.name}
                </h2>
                <button
                  onClick={() => toggleLock(round._id, round.isLocked)}
                  className={`flex items-center gap-1 px-3 py-1 rounded text-white ${
                    round.isLocked
                      ? "bg-red-500 hover:bg-red-600"
                      : "bg-green-500 hover:bg-green-600"
                  }`}
                >
                  {round.isLocked ? <Lock size={16} /> : <Unlock size={16} />}
                  {round.isLocked ? "Locked" : "Unlocked"}
                </button>
              </div>

              {/* ✅ Round details */}
              <p className="text-gray-500 mb-2">Total Weight: {round.weight}%</p>
              <ul className="text-sm text-gray-700 space-y-1">
                {round.criteria.map((c, idx) => (
                  <li key={idx} className="flex justify-between">
                    <span>{c.name}</span>
                    <span className="font-medium">{c.weight}%</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* ✅ Static Final Tally Card */}
          <div className="bg-white p-4 rounded-xl shadow border-2 border-emerald-500">
            <h2 className="text-xl font-semibold text-emerald-700">
              Mr. & Ms. LNK 2025 Final Tally
            </h2>
            <p className="text-gray-500 mb-2">
              Auto-calculated after all rounds
            </p>
            <ul className="text-sm text-gray-700 space-y-1">
              <li className="flex justify-between">
                <span>Production Number</span>
                <span className="font-medium">25%</span>
              </li>
              <li className="flex justify-between">
                <span>Sports Attire</span>
                <span className="font-medium">25%</span>
              </li>
              <li className="flex justify-between">
                <span>Formal Attire</span>
                <span className="font-medium">25%</span>
              </li>
              <li className="flex justify-between">
                <span>Q & A</span>
                <span className="font-medium">25%</span>
              </li>
              <li className="flex justify-between font-bold text-emerald-700">
                <span>Total Score</span>
                <span>100%</span>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
