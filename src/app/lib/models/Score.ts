import { Schema, model, models } from "mongoose";

const ScoreSchema = new Schema(
  {
    contestantId: { type: Schema.Types.ObjectId, ref: "Contestant", required: true },
    judgeId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    roundId: { type: Schema.Types.ObjectId, ref: "Round", required: true },
    criteriaScores: [
      {
        name: { type: String, required: true },
        rawScore: { type: Number, required: true },
        weight: { type: Number, required: true },
        weightedScore: { type: Number, required: true },
        notes: { type: String, default: "" },
      }, 
    ],
    totalRoundScore: { type: Number, required: true },
    isSubmitted: { type: Boolean, default: false },
    
  },
  { timestamps: true }
);

const Score = models.Score || model("Score", ScoreSchema);
export default Score;
