import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { calcLevel, BADGES } from "@/lib/gamification";

export async function GET() {
  const trainees = db.getTrainees();
  const allPoints = db.getAllUserPoints();
  const allAttempts = db.getUsers().flatMap(() => []).concat(); // just to import

  const ranking = trainees.map(user => {
    const pts = allPoints.find(p => p.user_id === user.id);
    const userAttempts = db.getAttemptsByUser(user.id);
    const avgScore = userAttempts.length > 0
      ? Math.round(userAttempts.reduce((sum, a) => sum + (a.score / Math.max(a.max_score, 1)) * 100, 0) / userAttempts.length)
      : 0;
    const badges = pts ? JSON.parse(pts.badges).map((bid: string) => BADGES[bid as keyof typeof BADGES]).filter(Boolean) : [];

    return {
      id: user.id, name: user.name,
      totalPoints: pts?.total_points || 0,
      levelInfo: calcLevel(pts?.total_points || 0),
      streak: pts?.streak || 0,
      badges,
      trainingsCompleted: userAttempts.length,
      avgScore,
    };
  }).sort((a, b) => b.totalPoints - a.totalPoints || b.trainingsCompleted - a.trainingsCompleted)
    .map((r, i) => ({ rank: i + 1, ...r }));

  return NextResponse.json(ranking);
}
