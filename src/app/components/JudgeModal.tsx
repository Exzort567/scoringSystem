"use client";
import { useState } from "react";
import axios from "axios";

interface Props {
  onClose: () => void;
  onSuccess: () => void;
  judge?: any;
}

export default function JudgeModal({ onClose, onSuccess, judge }: Props) {
  const [form, setForm] = useState({
    name: judge?.name || "",
    email: judge?.email || "",
    password: "",
    role: judge?.role || "judge",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (judge) {
        await axios.put(`/api/judges/${judge._id}`, form);
      } else {
        await axios.post("/api/judges", form);
      }
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Error saving judge:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">
          {judge ? "Edit Judge" : "Add Judge"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            className="w-full border p-2 rounded"
          />
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            className="w-full border p-2 rounded"
          />
          <input
            type="password"
            placeholder={judge ? "New Password (optional)" : "Password"}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full border p-2 rounded"
          />
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="w-full border p-2 rounded"
          >
            <option value="judge">Judge</option>
            <option value="admin">Admin</option>
          </select>

          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-emerald-600 text-white rounded"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
