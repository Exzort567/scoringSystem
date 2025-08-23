"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Contestant {
  _id: string;
  name: string;
  number: number;
  barangay: string;
}

export default function ContestantsPage() {
  const [contestants, setContestants] = useState<Contestant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/contestants")
      .then((res) => res.json())
      .then((data) => {
        setContestants(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <motion.h1
        className="text-3xl font-bold mb-6 text-emerald-600"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Contestants
      </motion.h1>

      {loading ? (
        <p className="text-gray-500">Loading contestants...</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contestants.map((c, index) => (
            <motion.div
              key={c._id}
              className="bg-white p-4 rounded-2xl shadow-md border border-gray-200 hover:shadow-lg transition-shadow"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <p className="text-lg font-semibold text-gray-800">{c.name}</p>
              <p className="text-gray-600">Number: {c.number}</p>
              <p className="text-gray-500 italic">Barangay: {c.barangay}</p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
