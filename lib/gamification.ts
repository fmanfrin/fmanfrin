export const BADGES = {
  FIRST_TRAINING: { id: "first_training", name: "Primeiro Passo", icon: "🎯", desc: "Completou o primeiro treinamento" },
  PERFECT_SCORE: { id: "perfect_score", name: "Perfeito!", icon: "⭐", desc: "10/10 em um treinamento" },
  STREAK_3: { id: "streak_3", name: "Em Chamas", icon: "🔥", desc: "3 treinamentos consecutivos" },
  STREAK_7: { id: "streak_7", name: "Imparável", icon: "🚀", desc: "7 treinamentos consecutivos" },
  TOP_10: { id: "top_10", name: "Elite", icon: "🏆", desc: "Top 10 do ranking" },
  SPEED_DEMON: { id: "speed_demon", name: "Veloz", icon: "⚡", desc: "Completou 5 treinamentos" },
} as const;

export const LEVELS = [
  { level: 1, name: "Iniciante", minPoints: 0, icon: "🌱" },
  { level: 2, name: "Aprendiz", minPoints: 100, icon: "📚" },
  { level: 3, name: "Praticante", minPoints: 300, icon: "💡" },
  { level: 4, name: "Especialista", minPoints: 600, icon: "🎓" },
  { level: 5, name: "Mestre", minPoints: 1000, icon: "🏅" },
  { level: 6, name: "Lenda", minPoints: 2000, icon: "👑" },
];

export function calcLevel(points: number) {
  let current = LEVELS[0];
  for (const l of LEVELS) {
    if (points >= l.minPoints) current = l;
  }
  return current;
}

export function calcPoints(score: number, maxScore: number, streak: number): number {
  const pct = maxScore > 0 ? score / maxScore : 0;
  let pts = Math.round(pct * 50);
  if (pct === 1) pts += 20; // perfect score bonus
  if (streak >= 3) pts = Math.round(pts * 1.2); // streak multiplier
  return pts;
}

export function checkBadges(
  currentBadges: string[],
  { totalPoints, streak, attemptCount, score, maxScore, rank }: {
    totalPoints: number; streak: number; attemptCount: number;
    score: number; maxScore: number; rank?: number;
  }
): string[] {
  const newBadges: string[] = [];
  const add = (b: string) => { if (!currentBadges.includes(b)) newBadges.push(b); };

  if (attemptCount >= 1) add(BADGES.FIRST_TRAINING.id);
  if (score === maxScore && maxScore > 0) add(BADGES.PERFECT_SCORE.id);
  if (streak >= 3) add(BADGES.STREAK_3.id);
  if (streak >= 7) add(BADGES.STREAK_7.id);
  if (attemptCount >= 5) add(BADGES.SPEED_DEMON.id);
  if (rank && rank <= 10) add(BADGES.TOP_10.id);

  return newBadges;
}
