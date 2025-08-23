import { Schema, model, models } from "mongoose";

const CriterionSchema = new Schema({
  name: { type: String, required: true },
  weight: { type: Number, required: true },
});

const RoundSchema = new Schema(
  {
    name: { type: String, required: true },
    criteria: [CriterionSchema],
    weight: { type: Number, required: true }, // total weight (e.g., 25)
    isLocked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Round = models.Round || model("Round", RoundSchema);
export default Round;
