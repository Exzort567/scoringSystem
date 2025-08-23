import { NextResponse } from "next/server";
import { connectDB } from "../../lib/mongodb";
import Contestant from "../../lib/models/Contestant";

export async function GET() {
  await connectDB();
  try {
    const contestants = await Contestant.find({}).sort({ number: 1 });
    return NextResponse.json(contestants, { status: 200 });
  } catch (error) {
    console.error("Error fetching contestants:", error);
    return NextResponse.json({ error: "Failed to fetch contestants" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  await connectDB();
  try {
    const data = await req.json();

    // Basic validation
    if (!data?.photoUrl) {
      return NextResponse.json({ error: "Photo is required" }, { status: 400 });
    }

    const number = Number(data.number);
    const age = Number(data.age);
    if (!Number.isFinite(number)) {
      return NextResponse.json({ error: "Valid contestant number is required" }, { status: 400 });
    }
    if (!Number.isFinite(age)) {
      return NextResponse.json({ error: "Valid age is required" }, { status: 400 });
    }
    const name = String(data.name ?? "").trim();
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Category: take from request body; default to "Mr"
    const categoryInput = String(data.category ?? "").trim();
    const category = categoryInput || "Mr";

    const payload = {
      name,
      number,
      age,
      category,
      barangay: String(data.barangay ?? "").trim(),
      photoUrl: String(data.photoUrl),
    };

    const created = await Contestant.create(payload);
    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
      if (error?.code === 11000 && error?.keyPattern?.number && error?.keyPattern?.category) {
        return NextResponse.json(
          { error: `Contestant #${error.keyValue.number} already exists in ${error.keyValue.category}` },
          { status: 409 }
        );
      }
      console.error("Error adding contestant:", error);
      return NextResponse.json({ error: "Failed to add contestant" }, { status: 500 });
    }
}
