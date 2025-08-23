import { Schema, model, models } from "mongoose";

const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    password: { type: String, required: true }, // hashed password
    role: { type: String, enum: ["judge", "admin"], default: "judge" },
    isOnline: { type: Boolean, default: false }, // for monitoring login status
  },
  { timestamps: true }
);

const User = models.User || model("User", UserSchema);
export default User;
