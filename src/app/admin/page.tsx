"use client";
import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const [contestants, setContestants] = useState<any[]>([]);
  const [judges, setJudges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session, status } = useSession();
  const router = useRouter();

  // 🔒 Redirect if not logged in
  useEffect(() => {
      if (status === "unauthenticated") {
        router.push("/login");
      }
    }, [status, router]);

    if (status === "loading") {
      return <p>Loading session...</p>;
    }

    if (status === "unauthenticated") {
      return null; // Will redirect
  }
  

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/dashboard-stats");
        const data = await res.json();
        setContestants(data.contestants || []);
        setJudges(data.judges || []);
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <p className="text-center p-4">Loading...</p>;

  return (
    <div className="p-6 bg-green-50 min-h-screen">
      <h1 className="text-3xl font-extrabold mb-6 text-green-800 text-center">
        Admin Dashboard
      </h1>

      {/* Stats Section */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="bg-green-100 shadow-md rounded-xl p-5 flex flex-col items-center">
          <span className="text-4xl font-bold text-green-700">{contestants.length}</span>
          <span className="text-green-900 font-semibold">Total Contestants</span>
        </div>
        <div className="bg-green-100 shadow-md rounded-xl p-5 flex flex-col items-center">
          <span className="text-4xl font-bold text-green-700">{judges.length}</span>
          <span className="text-green-900 font-semibold">Total Judges</span>
        </div>
      </div>

      {/* Judges Table */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-green-800">Judges</h2>
        <div className="overflow-hidden rounded-xl shadow-lg">
          <table className="w-full border-collapse">
            <thead className="bg-green-600 text-white">
              <tr>
                <th className="p-3 text-left">#</th>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Email</th>
             
              </tr>
            </thead>
            <tbody>
              {judges.map((j, index) => (
                <tr
                  key={j._id}
                  className={index % 2 === 0 ? "bg-green-50" : "bg-green-100"}
                >
                  <td className="p-3">{index + 1}</td>
                  <td className="p-3 font-medium">{j.name}</td>
                  <td className="p-3">{j.email}</td>
                
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Contestants Table */}
      <div>
        <h2 className="text-2xl font-bold mb-4 text-green-800">Contestants</h2>
        <div className="overflow-hidden rounded-xl shadow-lg">
          <table className="w-full border-collapse">
            <thead className="bg-green-600 text-white">
              <tr>
                <th className="p-3 text-left">#</th>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Category</th>
                <th className="p-3 text-left">Age</th>
                <th className="p-3 text-left">Barangay</th>
              </tr>
            </thead>
            <tbody>
              {contestants.map((c, index) => (
                <tr
                  key={c._id}
                  className={index % 2 === 0 ? "bg-green-50" : "bg-green-100"}
                >
                  <td className="p-3">{index + 1}</td>
                  <td className="p-3 flex items-center gap-3">
                    <img
                      src={c.photoUrl || "/default-avatar.png"}
                      alt={c.name}
                      className="w-10 h-10 rounded-full border-2 border-green-500 shadow-sm"
                    />
                    <span className="font-medium">{c.name}</span>
                  </td>
                  <td className="p-3">{c.category}</td>
                  <td className="p-3">{c.age}</td>
                  <td className="p-3">{c.barangay}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
