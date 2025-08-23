import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "../../lib/mongodb";
import User from "../../lib/models/Users";

export async function GET() {
  try {
    await connectDB();
    const judges = await User.find({ role: "judge" });
    return NextResponse.json(judges);
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch judges" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { name, email, password, role } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const judge = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "judge",
    });

    return NextResponse.json(judge);
  } catch (err) {
    return NextResponse.json({ error: "Failed to add judge" }, { status: 500 });
  }
}
