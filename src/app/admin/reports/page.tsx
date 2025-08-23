"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Type for rounds
interface Round {
  _id: string;
  name: string;
  barangay: string;
  weight: number;
}

// Type for scores returned by API
interface Score {
  _id: string;
  contestantId: { _id: string; name: string };
  judgeId: { _id: string; name: string; email: string };
  barangay?: string;
  totalRoundScore: number;
  createdAt: string;
}

export default function ReportsPage() {
  const [rounds, setRounds] = useState<Round[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch rounds to display buttons dynamically
  useEffect(() => {
    const fetchRounds = async () => {
      try {
        const res = await axios.get("/api/rounds");
        setRounds(res.data);
      } catch (err) {
        console.error("Error fetching rounds:", err);
      }
    };
    fetchRounds();
  }, []);

  // Handle print
  const handlePrint = async (roundId: string, roundName: string) => {
    try {
      setLoading(true);

      // Initialize PDF
      const doc = new jsPDF("p", "mm", "a4");

      // Load logo
      const logo = "/images/logo.jpg";
      const img = new Image();
      img.src = logo;

      img.onload = async () => {
        // Header
        doc.addImage(img, "PNG", 10, 10, 20, 20);
        doc.setFontSize(14);
        doc.text("Mr and Miss Linggo ng Kabataan 2025", 35, 20);
        doc.setFontSize(11);
        doc.text(`Round: ${roundName}`, 35, 28);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 35, 34);

        if (roundName === "Final Round (Top 5)") {
          // ✅ Fetch top 5 directly
          const { data } = await axios.get("/api/top5");

          // Mr Top 5
          autoTable(doc, {
            startY: 40,
            head: [["#", "Contestant", "Barangay", "Score"]],
            body: data.mrTop5.map((c: any, i: number) => [
              i + 1,
              `${c.number}. ${c.name}`,
              c.barangay,
              c.total.toFixed(2),
            ]),
            styles: { fontSize: 9 },
            headStyles: { fillColor: [46, 125, 50], textColor: [255, 255, 255] },
            theme: "grid",
          });

          // Ms Top 5 (start new section below)
          autoTable(doc, {
            startY: (doc as any).lastAutoTable.finalY + 10,
            head: [["#", "Contestant", "Barangay", "Score"]],
            body: data.missTop5.map((c: any, i: number) => [
              i + 1,
              
              `${c.number}. ${c.name}`,
              c.barangay,
              c.total.toFixed(2),
            ]),
            styles: { fontSize: 9 },
            headStyles: { fillColor: [46, 125, 50], textColor: [255, 255, 255] },
            theme: "grid",
          });
        } else {
          // ✅ Normal rounds (your existing code)
          const { data } = await axios.get(`/api/reports/${roundId}`);
          const { scores, date } = data;

          const tableData = scores.map((s: Score, i: number) => [
            i + 1,
            s.contestantId?.name || "N/A",
            s.contestantId?.barangay || "N/A",
            s.judgeId?.name || "N/A",
            s.totalRoundScore,
          ]);

          autoTable(doc, {
            startY: 40,
            head: [["#", "Contestant", "Barangay", "Judge", "Total Score"]],
            body: tableData,
            styles: { fontSize: 8 },
            headStyles: { fillColor: [46, 125, 50], textColor: [255, 255, 255] },
            theme: "grid",
          });
        }

        // Save PDF
        doc.save(`${roundName}_report.pdf`);
        setLoading(false);
      };
    } catch (err) {
      setLoading(false);
      console.error("Error generating report:", err);
      alert("Failed to generate PDF. Check console for details.");
    }
  };


  return (
    <div>
      <h1 className="text-2xl font-bold text-emerald-700">Reports</h1>
      <p className="text-gray-600 mb-4">Export score reports and rankings.</p>

      <div className="bg-white rounded-xl shadow p-6">
        {rounds.length === 0 ? (
          <p className="text-gray-500">No rounds found.</p>
        ) : (
          rounds.map((round) => (
            <div
              key={round._id}
              className="flex items-center justify-between mb-2"
            >
              <p className="text-gray-700">{round.name}</p>
              <button
                className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700 disabled:opacity-50"
                onClick={() => handlePrint(round._id, round.name)}
                disabled={loading}
              >
                {loading ? "Generating..." : "Print PDF"}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
