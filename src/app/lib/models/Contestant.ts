import mongoose, { Schema, models } from "mongoose";

const contestantSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    number: { type: Number, required: true },
    category: { type: String, enum: ["Mr", "Ms"], required: true },
    age: { type: Number, required: true },
    barangay: { type: String, required: true, trim: true },
    photoUrl: { type: String, required: true },
  },
  { timestamps: true }
);

contestantSchema.index({ number: 1, category: 1 }, { unique: true });

const Contestant =
  models.Contestant || mongoose.model("Contestant", contestantSchema);

export default Contestant;
