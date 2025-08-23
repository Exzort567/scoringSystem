"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import JudgeModal from "../../components/JudgeModal";

interface Judge {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export default function JudgesPage() {
  const [judges, setJudges] = useState<Judge[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedJudge, setSelectedJudge] = useState<Judge | null>(null);

  const fetchJudges = async () => {
    try {
      const res = await axios.get("/api/judges");
      setJudges(res.data);
    } catch (err) {
      console.error("Error fetching judges:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this judge?")) return;
    await axios.delete(`/api/judges/${id}`);
    fetchJudges();
  };

  useEffect(() => {
    fetchJudges();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-emerald-700">Judges</h1>
      <p className="text-gray-600 mb-4">Manage judges and reset passwords</p>

      <button
        onClick={() => {
          setSelectedJudge(null);
          setShowModal(true);
        }}
        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg mb-4"
      >
        + Add Judge
      </button>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="overflow-x-auto bg-white shadow rounded-xl">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-2 border">Name</th>
                <th className="p-2 border">Email</th>
                <th className="p-2 border">Role</th>
                <th className="p-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {judges.map((j) => (
                <tr key={j._id} className="hover:bg-gray-50">
                  <td className="p-2 border">{j.name}</td>
                  <td className="p-2 border">{j.email}</td>
                  <td className="p-2 border capitalize">{j.role}</td>
                  <td className="p-2 border flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedJudge(j);
                        setShowModal(true);
                      }}
                      className="px-3 py-1 bg-blue-500 text-white rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(j._id)}
                      className="px-3 py-1 bg-red-500 text-white rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <JudgeModal
          judge={selectedJudge || undefined}
          onClose={() => setShowModal(false)}
          onSuccess={fetchJudges}
        />
      )}
    </div>
  );
}
