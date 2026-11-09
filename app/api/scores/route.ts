import { NextResponse } from "next/server";
import { ScoreStore } from "@/lib/server/score-store";
import { CreateScoreSchema, UpdateScoreSchema } from "@/lib/validations/score";

export async function GET() {
  const scores = await ScoreStore.getAllScores();
  return NextResponse.json({ success: true, data: scores });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = CreateScoreSchema.parse(body);
    const created = await ScoreStore.createScore(validated);
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 400 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const validated = UpdateScoreSchema.parse(body);
    const updated = await ScoreStore.updateScore(validated.id, validated);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Peserta tidak ditemukan" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 400 }
    );
  }
}
