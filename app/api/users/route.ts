import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  return NextResponse.json(db.getUsers().sort((a, b) => a.name.localeCompare(b.name)));
}
