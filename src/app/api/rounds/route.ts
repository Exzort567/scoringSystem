import { NextResponse } from "next/server";
import { connectDB } from "../../lib/mongodb";
import Round from "../../lib/models/Round";

const defaultRounds = [
  {
    name: "Production Number",
    criteria: [
      { name: "Sync & Energy", weight: 10 },
      { name: "Stage Presence & Confidence", weight: 10 },
      { name: "Showmanship", weight: 5 },
    ],
    weight: 25,
  },
  {
    name: "Sports Attire",
    criteria: [
      { name: "Confidence & Posture", weight: 10 },
      { name: "Fitness & Physique", weight: 10 },
      { name: "Styling & Presentation", weight: 5 },
    ],
    weight: 25,
  },
  {
    name: "Q&A",
    criteria: [
      { name: "Substance of Answer", weight: 10 },
      { name: "Eloquence & Clarity", weight: 10 },
      { name: "Sincerity & Conviction", weight: 5 },
    ],
    weight: 25,
  },
  {
    name: "Formal Attire",
    criteria: [
      { name: "Poise & Stage Presence", weight: 10 },
      { name: "Attire & Styling", weight: 10 },
      { name: "Walk & Turns", weight: 5 },
    ],
    weight: 25,
  },
  {
    name: "Final Tally",
    criteria: [
      { name: "Production Number", weight: 25 },
      { name: "Sports Attire", weight: 25 },
      { name: "Formal Attire", weight: 25 },
      { name: "Q&A", weight: 25 },
    ],
    weight: 100,
  },
  {
    name: "Final Round (Top 5)", // ✅ rename to match your UI
    weight: 100,
    criteria: [
      {
        name: "Poise & Confidence",
        weight: 10,
        description:
          "The contestant's bearing and composure. Does she appear self-assured and graceful on stage? Is there a sense of elegance in her movements?",
        hasNotes: true,
      },
      {
        name: "Stage Walk & Posture",
        weight: 10,
        description:
          "The contestant's walk. Is it purposeful and fluid? Is her posture erect and elegant? Does she command the stage with her movements?",
        hasNotes: true,
      },
      {
        name: "Eye Contact & Audience Connection",
        weight: 10,
        description:
          "The contestant's ability to connect with the audience and judges. Does she make consistent and meaningful eye contact? Does her gaze project confidence and warmth?",
        hasNotes: true,
      },
      {
        name: "Facial Expression",
        weight: 10,
        description:
          "The contestant's facial expressions. Are they genuine, engaging, and reflective of her personality? Does she smile with her eyes?",
        hasNotes: true,
      },
      {
        name: "Energy & X-Factor",
        weight: 10,
        description:
          "The contestant's overall energy and star quality. Does she project a captivating presence? Does she have a unique charisma that makes her stand out?",
        hasNotes: true,
      },
      {
        name: "Authenticity",
        weight: 10,
        description:
          "The genuineness of the contestant's performance. Does she seem like she is being her true self, or is her presence rehearsed?",
        hasNotes: true,
      },
      {
        name: "Consistency",
        weight: 10,
        description:
          "The contestant's ability to maintain her poise and presence across all segments of the competition (e.g., from the opening number to the final walk).",
        hasNotes: true,
      },
      {
        name: "Final Impression",
        weight: 10,
        description:
          "The overall lasting impression the contestant leaves on the judges. Is it memorable, positive, and aligned with what the pageant is looking for in a winner?",
        hasNotes: true,
      },
    ],
  },
];

// GET rounds (with optional ?isLocked=)
export async function GET(req: Request) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const isLockedParam = searchParams.get("isLocked");

  const filter: any = {};
  if (isLockedParam !== null) filter.isLocked = isLockedParam === "true";

  const rounds = await Round.find(filter).lean();
  return NextResponse.json(rounds);
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const round = await Round.create(body);
    return NextResponse.json(round, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
