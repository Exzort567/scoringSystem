"use client";
import { useState } from "react";
import axios from "axios";
import { uploadToCloudinary } from "../lib/cloudinary";

interface Props {
  onClose: () => void;
  onSuccess: () => void;
  contestant?: any; // for editing
}

export default function ContestantModal({ onClose, onSuccess, contestant }: Props) {
  const [form, setForm] = useState({
    number: contestant?.number?.toString() || "",
    name: contestant?.name || "",
    age: contestant?.age?.toString() || "",
    category: contestant?.category || "Mr",
    barangay: contestant?.barangay || "",
    photoUrl: contestant?.photoUrl || "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrMsg("");
    setLoading(true);

    try {
      let uploadedUrl = form.photoUrl;

      // Require a photo on CREATE
      if (!contestant && !file) {
        setErrMsg("Please select a photo to upload.");
        setLoading(false);
        return;
      }

      if (file) {
        uploadedUrl = await uploadToCloudinary(file);
      }

      const payload = {
        number: Number(form.number),
        name: form.name.trim(),
        age: Number(form.age),
        category: form.category || contestant?.category || "Mr",
        barangay: form.barangay.trim(),
        photoUrl: uploadedUrl,
      };

      if (contestant) {
        await axios.put(`/api/contestants/${contestant._id}`, payload);
      } else {
        await axios.post("/api/contestants", payload);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Error saving contestant:", err);
      const message =
        err?.response?.data?.error ||
        "Something went wrong while saving the contestant.";
      setErrMsg(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">
          {contestant ? "Edit Contestant" : "Add Contestant"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="number"
            placeholder="Contestant Number"
            value={form.number}
            onChange={(e) => setForm({ ...form, number: e.target.value })}
            required
            className="w-full border p-2 rounded"
          />

          <input
            type="text"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            className="w-full border p-2 rounded"
          />
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            required
            className="w-full border p-2 rounded"
          >
            <option value="Mr">Mr</option>
            <option value="Ms">Ms</option>
          </select>

          <input
            type="text"
            placeholder="Barangay"
            value={form.barangay}
            onChange={(e) => setForm({ ...form, barangay: e.target.value })}
            required
            className="w-full border p-2 rounded"
          />

          <input
            type="number"
            placeholder="Age"
            value={form.age}
            onChange={(e) => setForm({ ...form, age: e.target.value })}
            required
            className="w-full border p-2 rounded"
          />

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full"
          />

          {form.photoUrl && !file && (
            <img
              src={form.photoUrl}
              alt="preview"
              className="w-24 h-24 object-cover rounded mt-2"
            />
          )}

          {errMsg && <p className="text-red-600 text-sm">{errMsg}</p>}

          <div className="flex justify-end gap-2 mt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">
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
