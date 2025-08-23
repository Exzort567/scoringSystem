import { NextResponse } from "next/server";
import { connectDB } from "../../lib/mongodb";
import Contestant from "../../lib/models/Contestant";
import User from "../../lib/models/Users";

export async function GET() {
  try {
    await connectDB();

    // Fetch all contestants and judges
    const contestants = await Contestant.find();
    const judges = await User.find({ role: "judge" }); // only judges

    return NextResponse.json({
      contestants,
      judges,
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      { message: "Error fetching dashboard data" },
      { status: 500 }
    );
  }
}
