import { NextResponse } from "next/server";
import connectDB  from "../../lib/mongodb";
import Contestant from "../../lib/models/Contestant";

export async function GET() {
  try {
    await dbConnect();

    // Add a test contestant
    const contestant = await Contestant.create({
      name: "Test Contestant",
      number: 1,
      barangay: "Canmaya Diot",
    });

    return NextResponse.json({ message: "Contestant added!", contestant });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to connect to MongoDB" }, { status: 500 });
  }
}
