"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import ContestantModal from "../../components/ContestantModal";

interface Contestant {
  _id: string;
  number: number;
  name: string;
  category: string;
  age: number;
  barangay: string;
  photoUrl: string;
}

export default function ContestantsPage() {
  const [contestants, setContestants] = useState<Contestant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedContestant, setSelectedContestant] = useState<Contestant | null>(null);

  const fetchContestants = async () => {
    const res = await axios.get("/api/contestants");
    setContestants(res.data);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this contestant?")) return;
    await axios.delete(`/api/contestants/${id}`);
    fetchContestants();
  };

  useEffect(() => {
    fetchContestants();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-emerald-700">Contestants</h1>
      <p className="text-gray-600 mb-4">Manage contestants</p>

      <button
        onClick={() => {
          setSelectedContestant(null);
          setShowModal(true);
        }}
        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg mb-4"
      >
        + Add Contestant
      </button>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          {contestants.map((c) => (
            <div key={c._id} className="bg-white shadow rounded-xl p-4 flex flex-col items-center">
                {/* White square box */}
                <div className="w-[159px] h-[150px] bg-white">
                    <img
                    src={c.photoUrl}
                    alt={c.name}
                    className="w-[159px] h-[150px] rounded-lg"
                    />
                </div>

                <h2 className="font-bold mt-3">{c.number}. {c.name}</h2>
                <h2 className="font-bold mt-3">{c.barangay}</h2>
                <p className="text-sm text-gray-500">Age: {c.age}</p>
                <div className="flex gap-2 mt-2">
                    <button
                    onClick={() => {
                        setSelectedContestant(c);
                        setShowModal(true);
                    }}
                    className="px-3 py-1 bg-blue-500 text-white rounded"
                    >
                    Edit
                    </button>
                    <button
                    onClick={() => handleDelete(c._id)}
                    className="px-3 py-1 bg-red-500 text-white rounded"
                    >
                    Delete
                    </button>
                </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <ContestantModal
          contestant={selectedContestant || undefined}
          onClose={() => setShowModal(false)}
          onSuccess={fetchContestants}
        />
      )}
    </div>
  );
}
