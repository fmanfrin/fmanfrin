/**
 * Ranking Service
 * Calculates and manages rankings across the platform
 */

import { supabase } from '../supabase';

export interface RankingEntry {
  position: number;
  employeeId: string;
  employeeName: string;
  area: string;
  points: number;
  level: string;
  avgScore: number;
  trainingsCompleted: number;
  badges: number;
  change?: 'up' | 'down' | 'stable';
  changeAmount?: number;
}

export interface RankingOptions {
  organizationId: string;
  type: 'general' | 'department' | 'team' | 'training';
  departmentId?: string;
  teamId?: string;
  trainingId?: string;
  period?: 'overall' | 'monthly' | 'quarterly' | 'yearly';
  limit?: number;
  offset?: number;
}

/**
 * Get employee ranking data
 */
export async function getEmployeeRankingData(employeeId: string) {
  // Get points
  const { data: pointsEvents } = await supabase
    .from('points_events')
    .select('points')
    .eq('employee_id', employeeId);

  const totalPoints = (pointsEvents || []).reduce((sum, e) => sum + (e.points || 0), 0);

  // Get training stats
  const { data: attempts } = await supabase
    .from('training_attempts')
    .select('score, max_score, status')
    .eq('employee_id', employeeId)
    .eq('status', 'submitted');

  const completedCount = attempts?.length || 0;
  const avgScore =
    completedCount > 0
      ? attempts!.reduce((sum, a) => sum + ((a.score || 0) / (a.max_score || 100)) * 100, 0) /
        completedCount
      : 0;

  // Get badges
  const { data: badges } = await supabase
    .from('employee_badges')
    .select('*', { count: 'exact' })
    .eq('employee_id', employeeId);

  return {
    totalPoints,
    completedCount,
    avgScore: Math.round(avgScore),
    badgesCount: badges?.length || 0,
  };
}

/**
 * Calculate general ranking for organization
 */
export async function calculateGeneralRanking(
  organizationId: string,
  limit: number = 50,
  offset: number = 0
): Promise<RankingEntry[]> {
  // Get all employees with their data
  const { data: employees } = await supabase
    .from('employees')
    .select('id, full_name, department:departments(name)')
    .eq('organization_id', organizationId)
    .eq('status', 'active');

  if (!employees || employees.length === 0) return [];

  // Get ranking data for each employee
  const rankingPromises = (employees || []).map(async (emp) => {
    const data = await getEmployeeRankingData(emp.id);

    return {
      employeeId: emp.id,
      employeeName: emp.full_name,
      area: (emp.department as any)?.name || 'N/A',
      points: data.totalPoints,
      avgScore: data.avgScore,
      trainingsCompleted: data.completedCount,
      badges: data.badgesCount,
    };
  });

  const allRankings = await Promise.all(rankingPromises);

  // Sort by points (primary), then avg score (secondary), then trainings (tertiary)
  allRankings.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.avgScore !== a.avgScore) return b.avgScore - a.avgScore;
    return b.trainingsCompleted - a.trainingsCompleted;
  });

  // Add positions
  const ranked: RankingEntry[] = allRankings.map((r, idx) => ({
    position: idx + 1,
    ...r,
    level: getLevelForPoints(r.points),
  }));

  return ranked.slice(offset, offset + limit);
}

/**
 * Calculate department ranking
 */
export async function calculateDepartmentRanking(
  organizationId: string,
  departmentId: string,
  limit: number = 50,
  offset: number = 0
): Promise<RankingEntry[]> {
  const { data: employees } = await supabase
    .from('employees')
    .select('id, full_name, department:departments(name)')
    .eq('organization_id', organizationId)
    .eq('department_id', departmentId)
    .eq('status', 'active');

  if (!employees) return [];

  const rankingPromises = (employees || []).map(async (emp) => {
    const data = await getEmployeeRankingData(emp.id);
    return {
      employeeId: emp.id,
      employeeName: emp.full_name,
      area: (emp.department as any)?.name || 'N/A',
      points: data.totalPoints,
      avgScore: data.avgScore,
      trainingsCompleted: data.completedCount,
      badges: data.badgesCount,
    };
  });

  const allRankings = await Promise.all(rankingPromises);

  allRankings.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.avgScore !== a.avgScore) return b.avgScore - a.avgScore;
    return b.trainingsCompleted - a.trainingsCompleted;
  });

  const ranked = allRankings.map((r, idx) => ({
    position: idx + 1,
    ...r,
    level: getLevelForPoints(r.points),
  }));

  return ranked.slice(offset, offset + limit);
}

/**
 * Get top 3 employees for medals display
 */
export async function getTopThree(
  organizationId: string,
  type: 'general' | 'department' = 'general',
  departmentId?: string
): Promise<RankingEntry[]> {
  let ranking: RankingEntry[];

  if (type === 'department' && departmentId) {
    ranking = await calculateDepartmentRanking(organizationId, departmentId, 3, 0);
  } else {
    ranking = await calculateGeneralRanking(organizationId, 3, 0);
  }

  return ranking.slice(0, 3);
}

/**
 * Get level name for points
 */
export function getLevelForPoints(points: number): string {
  if (points < 200) return 'Iniciante';
  if (points < 500) return 'Aprendiz';
  if (points < 1000) return 'Desenvolvedor';
  if (points < 2000) return 'Especialista';
  if (points < 4000) return 'Mestre';
  return 'Elite';
}

/**
 * Get level icon for points
 */
export function getLevelIconForPoints(points: number): string {
  if (points < 200) return '🌱';
  if (points < 500) return '📚';
  if (points < 1000) return '⚡';
  if (points < 2000) return '🎯';
  if (points < 4000) return '👑';
  return '⭐';
}

/**
 * Calculate position change from previous ranking
 */
export async function calculatePositionChange(
  employeeId: string,
  organizationId: string,
  currentRanking: RankingEntry[]
): Promise<{ change: 'up' | 'down' | 'stable'; amount: number }> {
  // Get previous position from history (simplified - would use snapshots in real system)
  const currentPos = currentRanking.find((r) => r.employeeId === employeeId)?.position || 0;

  // In a full implementation, would compare with previous ranking snapshot
  // For now, return stable as default
  return {
    change: 'stable',
    amount: 0,
  };
}
