"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { ably } from "../lib/ably";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Criterion {
  name: string;
  weight: number; // max points (10 for Final Round)
  description?: string;
  hasNotes?: boolean;
}

interface Round {
  _id: string;
  name: string;
  criteria: Criterion[];
  weight: number;
  isLocked: boolean;
}

interface Contestant {
  _id: string;
  number: number;
  name: string;
  barangay: string;
  photoUrl: string;
}

export default function JudgePage() {
  const { data: session, status } = useSession();
  const [activeRound, setActiveRound] = useState<Round | null>(null);
  const [contestants, setContestants] = useState<Contestant[]>([]);
  const [scores, setScores] = useState<Record<string, Record<string, number>>>({});   // score per criterion
  const [notes, setNotes] = useState<Record<string, Record<string, string>>>({});     // notes per criterion (final round)
  const [errors, setErrors] = useState<Record<string, Record<string, boolean>>>({});
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return <p>Loading session...</p>;
  }

  if (status === "unauthenticated") {
    return null;
  }

  const fetchActiveRound = async () => {
    const res = await axios.get("/api/rounds?isLocked=false");
    if (res.data.length === 1) setActiveRound(res.data[0]);
    else setActiveRound(null);
    setLoading(false);
  };

  // for normal rounds: all contestants; for Final: only top5
  const fetchContestants = async () => {
    if (activeRound?.name === "Final Round (Top 5)") {
      const res = await axios.get("/api/top5");
      // Combine Mr and Ms arrays into one list
      const combined = [...(res.data.mrTop5 || []), ...(res.data.missTop5 || [])];
      setContestants(combined);
      return;
    }

    const res = await axios.get("/api/contestants");
    console.log("All Contestants API Response:", res.data);
    setContestants(res.data || []);
  };


  const handleScoreChange = (contestantId: string, criterion: Criterion, value: number) => {
    const min = 0;  // for normal rounds
    const max = criterion.weight ?? 10; // final round = 10
    const isInvalid = value < min || value > max;

    setScores((prev) => ({
      ...prev,
      [contestantId]: { ...(prev[contestantId] || {}), [criterion.name]: value },
    }));

    setErrors((prev) => ({
      ...prev,
      [contestantId]: { ...(prev[contestantId] || {}), [criterion.name]: isInvalid },
    }));
  };

  const handleNoteChange = (contestantId: string, criterion: Criterion, value: string) => {
    setNotes((prev) => ({
      ...prev,
      [contestantId]: { ...(prev[contestantId] || {}), [criterion.name]: value },
    }));
  };

  const submitAllScores = async () => {
    if (!activeRound) return;

    const hasErrors = Object.values(errors).some((c) => Object.values(c).some(Boolean));
    if (hasErrors) return alert("⚠️ Please fix invalid scores before submitting.");

    await axios.post("/api/scores", {
      roundId: activeRound._id,
      scores,
      notes, // optional - only used in final round if you modify backend
      judgeId: session?.user?.id,
    });

    const channel = ably.channels.get("scores");
    channel.publish("newScore", { roundId: activeRound._id });
    alert("✅ Scores submitted successfully!");
  };

  useEffect(() => {
    fetchActiveRound();
    // subscribe to round change
    const channel = ably.channels.get("rounds");
    const handler = () => fetchActiveRound();
    channel.subscribe("roundChange", handler);
    return () => channel.unsubscribe("roundChange", handler);
  }, []);

  useEffect(() => {
    if (activeRound) fetchContestants();
  }, [activeRound]);

  if (loading) return <p>Loading...</p>;

  if (!activeRound)
    return (
      <div className="min-h-screen flex flex-col">
        <Nav name={session?.user?.name || "Judge"} />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-600 text-lg">⏳ Please wait for admin to unlock a round.</p>
        </div>
      </div>
    );

  const isFinal = activeRound.name === "Final Round (Top 5)";

  return (
    <div className="min-h-screen flex flex-col">
      <Nav name={session?.user?.name || "Judge"} />
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold text-emerald-700 mb-1">Judge Dashboard</h1>
        <p className="text-gray-600 mb-4">
          Active Round: <span className="font-semibold">{activeRound.name}</span>
        </p>

        {isFinal && (
          <p className="text-sm text-gray-500 mb-3">
            <strong>Scoring:</strong> 1 is the lowest, 10 is the highest.
          </p>
        )}

        <div className="overflow-x-auto">
          <table className="w-full border-collapse border">
            <thead>
              <tr className="bg-emerald-600 text-white">
                <th className="p-2 border">#</th>
                <th className="p-2 border">Name</th>
                <th className="p-2 border">Barangay</th>
                {activeRound.criteria.map((c) => (
                  <th key={c.name} className="p-2 border">
                    <div className="text-left">
                      <div>{c.name} ({c.weight})</div>
                      {isFinal && c.description && (
                        <div className="text-[11px] text-emerald-100 leading-tight mt-1">
                          {c.description}
                        </div>
                      )}
                    </div>
                  </th>
                ))}
                {isFinal && <th className="p-2 border">Notes / Comments</th>}
              </tr>
            </thead>
            <tbody>
              {contestants.map((c) => (
                <tr key={c._id} className="odd:bg-gray-50">
                  <td className="p-2 border">{c.number}</td>
                  <td className="p-2 border">
                    <div className="flex items-center gap-2">
                      <Image src={c.photoUrl || "/images/avatar.png"} alt={c.name} width={40} height={40} className="rounded-full object-cover" />
                      <span className="font-medium">{c.name}</span>
                    </div>
                  </td>
                  <td className="p-2 border">{c.barangay}</td>

                  {activeRound.criteria.map((criterion) => {
                    const value = scores[c._id]?.[criterion.name] ?? "";
                    const isInvalid = errors[c._id]?.[criterion.name] ?? false;
                    const noteValue = notes[c._id]?.[criterion.name] ?? "";

                    return (
                      <td key={criterion.name} className="p-2 border">
                        <div className="flex flex-col items-center">
                          <input
                            type="number"
                            min={0}
                            max={criterion.weight}  // 10 for final round
                            value={value}
                            onChange={(e) => handleScoreChange(c._id, criterion, Number(e.target.value))}
                            className={`border px-2 py-1 rounded w-16 text-center ${
                              isInvalid ? "border-red-500 text-red-600" : "border-gray-300"
                            }`}
                          />
                          <span className="text-xs text-gray-400 mt-1">
                            {isFinal ? "1–10" : `0–${criterion.weight}`}
                          </span>
                        </div>
                        {/* ✅ Only show notes if this criterion hasNotes */}
                        {isFinal && criterion.hasNotes && (
                          <textarea
                            rows={2}
                            className="w-full border rounded p-1 text-xs mt-2"
                            placeholder={`Notes for ${criterion.name}`}
                            value={noteValue}
                            onChange={(e) => handleNoteChange(c._id, criterion, e.target.value)}
                          />
                        )}
                      </td>
                    );
                  })}

                  {isFinal && (
                    <td className="p-2 border">
                      <textarea
                        rows={2}
                        className="w-56 border rounded p-2 text-sm"
                        placeholder="Notes / comments…"
                        value={notes[c._id]?.__common || ""}
                        onChange={(e) =>
                          setNotes((prev) => ({
                            ...prev,
                            [c._id]: { ...(prev[c._id] || {}), __common: e.target.value },
                          }))
                        }
                      />
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={submitAllScores}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg"
          >
            Submit All Scores
          </button>
        </div>
      </main>
    </div>
  );
}

function Nav({ name }: { name: string }) {
  return (
    <nav className="bg-emerald-700 text-white p-4 flex justify-between items-center shadow">
      <div className="flex items-center gap-2">
        <Image src="/images/logo.jpg" alt="Logo" width={46} height={46} className="rounded-full" />
        <h1 className="text-lg font-bold">Mr. & Ms. Linggo ng Kabataan 2025</h1>
      </div>
      <div className="flex items-center gap-4">
        <span className="font-medium">{name}</span>
        <button onClick={() => signOut({ callbackUrl: "/login" })} className="bg-gray-900 hover:bg-gray-800 px-3 py-1 rounded-lg text-sm">
          Logout
        </button>
      </div>
    </nav>
  );
}
