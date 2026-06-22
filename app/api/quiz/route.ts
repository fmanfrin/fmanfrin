import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { Attempt, UserPoints } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import { calcPoints, checkBadges, calcLevel } from "@/lib/gamification";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    const { userId, trainingId, answers } = await req.json() as { userId: string; trainingId: string; answers: number[] };

    const training = db.getTrainingById(trainingId);
    if (!training) return NextResponse.json({ error: "Treinamento não encontrado" }, { status: 404 });

    const questions = JSON.parse(training.questions) as Array<{
      id: number; question: string; options: string[]; correct: number; explanation: string;
    }>;

    let score = 0;
    const results = questions.map((q, idx) => {
      const userAnswer = answers[idx] ?? -1;
      const isCorrect = userAnswer === q.correct;
      if (isCorrect) score++;
      return { question: q.question, userAnswer, correct: q.correct, isCorrect, explanation: q.explanation };
    });

    const maxScore = questions.length;
    const pct = Math.round((score / maxScore) * 100);

    const userPointsData = db.getUserPoints(userId);
    const currentBadges: string[] = userPointsData ? JSON.parse(userPointsData.badges) : [];
    const currentStreak = userPointsData?.streak || 0;
    const newStreak = score > 0 ? currentStreak + 1 : 0;
    const attemptCount = db.countAttemptsByUser(userId) + 1;
    const pointsEarned = calcPoints(score, maxScore, newStreak);
    const totalPoints = (userPointsData?.total_points || 0) + pointsEarned;

    const allPoints = db.getAllUserPoints().sort((a, b) => b.total_points - a.total_points);
    const rank = allPoints.findIndex(p => p.user_id === userId) + 1;

    const newBadges = checkBadges(currentBadges, { totalPoints, streak: newStreak, attemptCount, score, maxScore, rank });
    const allBadges = [...currentBadges, ...newBadges];
    const levelInfo = calcLevel(totalPoints);

    const attempt: Attempt = {
      id: uuidv4(), user_id: userId, training_id: trainingId,
      score, max_score: maxScore, answers: JSON.stringify(answers),
      completed_at: new Date().toISOString(),
    };
    db.insertAttempt(attempt);

    const updatedPoints: UserPoints = {
      user_id: userId, total_points: totalPoints, level: levelInfo.level,
      streak: newStreak, badges: JSON.stringify(allBadges), last_activity: new Date().toISOString(),
    };
    db.upsertUserPoints(updatedPoints);

    const feedbackMsg = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 300,
      messages: [{
        role: "user",
        content: `Usuário completou "${training.title}" com ${score}/${maxScore} (${pct}%). Dê um feedback motivacional em 2 frases em português.`,
      }],
    });
    const feedback = (feedbackMsg.content[0] as { type: "text"; text: string }).text;

    const badgeList = newBadges.map(bid => {
      const { BADGES } = require("@/lib/gamification");
      return BADGES[bid as keyof typeof BADGES];
    }).filter(Boolean);

    return NextResponse.json({ score, maxScore, pct, results, pointsEarned, totalPoints, newBadges: badgeList, levelInfo, feedback, streak: newStreak });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
