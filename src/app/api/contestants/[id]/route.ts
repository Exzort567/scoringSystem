import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/mongodb";
import Contestant from "../../../lib/models/Contestant";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  await connectDB();
  try {
    const body = await req.json();

    // Cast numbers if provided
    const update: any = { ...body };
    if (typeof update.number !== "undefined") update.number = Number(update.number);
    if (typeof update.age !== "undefined") update.age = Number(update.age);

    const updated = await Contestant.findByIdAndUpdate(params.id, update, {
      new: true,
      runValidators: true,
    });
    return NextResponse.json(updated);
  } catch (error: any) {
    if (error?.code === 11000 && error?.keyPattern?.number) {
      return NextResponse.json(
        { error: "Contestant number already exists" },
        { status: 409 }
      );
    }
    console.error("Error updating contestant:", error);
    return NextResponse.json(
      { error: "Failed to update contestant" },
      { status: 500 }
    );
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await connectDB();
  try {
    await Contestant.findByIdAndDelete(params.id);
    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    console.error("Error deleting contestant:", error);
    return NextResponse.json(
      { error: "Failed to delete contestant" },
      { status: 500 }
    );
  }
}
