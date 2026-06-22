import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const training = db.getTrainingById(id);
  if (!training) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  return NextResponse.json({ ...training, questions: JSON.parse(training.questions) });
}
