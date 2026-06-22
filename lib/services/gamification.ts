/**
 * Gamification Service
 * Handles points, levels, badges, and history
 */

import { supabase } from '../supabase';

export interface PointsAwardConfig {
  organizationId: string;
  employeeId: string;
  eventType: 'training_completion' | 'perfect_score' | 'quick_completion' | 'badge_earned' | 'level_up';
  points: number;
  trainingId?: string;
  competitionId?: string;
  description?: string;
}

export interface LevelDefinition {
  id: string;
  name: string;
  minPoints: number;
  maxPoints: number;
  color: string;
  icon: string;
  position: number;
}

/**
 * Default levels for new organizations
 */
export const DEFAULT_LEVELS: Omit<LevelDefinition, 'id' | 'organizationId'>[] = [
  { name: 'Iniciante', minPoints: 0, maxPoints: 199, color: '#94a3b8', icon: '🌱', position: 1 },
  { name: 'Aprendiz', minPoints: 200, maxPoints: 499, color: '#3b82f6', icon: '📚', position: 2 },
  { name: 'Desenvolvedor', minPoints: 500, maxPoints: 999, color: '#8b5cf6', icon: '⚡', position: 3 },
  { name: 'Especialista', minPoints: 1000, maxPoints: 1999, color: '#f59e0b', icon: '🎯', position: 4 },
  { name: 'Mestre', minPoints: 2000, maxPoints: 3999, color: '#ef4444', icon: '👑', position: 5 },
  { name: 'Elite', minPoints: 4000, maxPoints: 999999, color: '#fbbf24', icon: '⭐', position: 6 },
];

/**
 * Default badges for new organizations
 */
export const DEFAULT_BADGES = [
  {
    id: 'first_training',
    name: 'Primeiro Treinamento',
    description: 'Concluiu o primeiro treinamento',
    criteria: { eventType: 'training_completion', count: 1 },
    icon: '🎓',
    color: '#3b82f6',
  },
  {
    id: 'perfect_score',
    name: 'Nota Máxima',
    description: 'Obteve 100% em um treinamento',
    criteria: { eventType: 'perfect_score' },
    icon: '⭐',
    color: '#fbbf24',
  },
  {
    id: 'quick_learner',
    name: 'Aprendiz Rápido',
    description: 'Completou treinamento em tempo recorde',
    criteria: { eventType: 'quick_completion' },
    icon: '⚡',
    color: '#10b981',
  },
  {
    id: 'five_trainings',
    name: 'Sequência de 5',
    description: 'Completou 5 treinamentos em sequência',
    criteria: { eventType: 'training_completion', count: 5 },
    icon: '🔥',
    color: '#ef4444',
  },
  {
    id: 'knowledge_expert',
    name: 'Especialista de Conhecimento',
    description: 'Atingiu nível Especialista',
    criteria: { eventType: 'level_up', level: 'Especialista' },
    icon: '🎯',
    color: '#f59e0b',
  },
];

/**
 * Calculate points for training completion
 */
export function calculateTrainingPoints(config: {
  percentageScore: number;
  timeMinutes: number;
  estimatedTimeMinutes: number;
  maxPoints: number;
  isPerfectScore: boolean;
  isQuickCompletion: boolean;
}): { basePoints: number; bonusPoints: number; totalPoints: number } {
  let basePoints = 0;
  let bonusPoints = 0;

  // Base points: percentage of max points
  basePoints = Math.round((config.percentageScore / 100) * config.maxPoints);

  // Bonus: Perfect score (+20%)
  if (config.isPerfectScore) {
    bonusPoints += Math.round(config.maxPoints * 0.2);
  }

  // Bonus: Quick completion (finished in 50% of estimated time, +10%)
  if (config.isQuickCompletion && config.timeMinutes < config.estimatedTimeMinutes * 0.5) {
    bonusPoints += Math.round(config.maxPoints * 0.1);
  }

  return {
    basePoints,
    bonusPoints,
    totalPoints: basePoints + bonusPoints,
  };
}

/**
 * Award points to employee
 */
export async function awardPoints(config: PointsAwardConfig) {
  const { data, error } = await supabase
    .from('points_events')
    .insert([
      {
        organization_id: config.organizationId,
        employee_id: config.employeeId,
        event_type: config.eventType,
        points: config.points,
        training_id: config.trainingId,
        competition_id: config.competitionId,
        description: config.description,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get employee's total points
 */
export async function getEmployeeTotalPoints(employeeId: string): Promise<number> {
  const { data, error } = await supabase
    .from('points_events')
    .select('points', { count: 'exact' })
    .eq('employee_id', employeeId);

  if (error) throw error;

  return (data || []).reduce((sum, event) => sum + (event.points || 0), 0);
}

/**
 * Get employee's current level
 */
export async function getEmployeeCurrentLevel(
  employeeId: string,
  organizationId: string
): Promise<any> {
  const totalPoints = await getEmployeeTotalPoints(employeeId);

  const { data: levels, error } = await supabase
    .from('knowledge_levels')
    .select('*')
    .eq('organization_id', organizationId)
    .order('position', { ascending: true });

  if (error) throw error;

  const currentLevel =
    (levels || []).find(
      (l) =>
        totalPoints >= l.min_points && totalPoints <= (l.max_points || 999999)
    ) || (levels || [])[0];

  return { currentLevel, totalPoints };
}

/**
 * Update employee level if needed
 */
export async function updateEmployeeLevel(
  employeeId: string,
  organizationId: string
): Promise<{ levelChanged: boolean; newLevel: any }> {
  const { currentLevel, totalPoints } = await getEmployeeCurrentLevel(
    employeeId,
    organizationId
  );

  // Get previous level history
  const { data: history } = await supabase
    .from('employee_level_history')
    .select('*')
    .eq('employee_id', employeeId)
    .order('achieved_at', { ascending: false })
    .limit(1)
    .single();

  const previousLevel = history?.level_id;
  const levelChanged = previousLevel !== currentLevel?.id;

  if (levelChanged && currentLevel) {
    // Record level change
    const { error } = await supabase
      .from('employee_level_history')
      .insert([
        {
          employee_id: employeeId,
          level_id: currentLevel.id,
          total_points: totalPoints,
          achieved_at: new Date(),
        },
      ]);

    if (error) throw error;

    // Award badge if level changed
    if (previousLevel !== currentLevel?.id) {
      await awardPoints({
        organizationId,
        employeeId,
        eventType: 'level_up',
        points: 0, // Level up doesn't award extra points
        description: `Alcançou nível ${currentLevel.name}`,
      });
    }
  }

  return { levelChanged, newLevel: currentLevel };
}

/**
 * Check and award badges
 */
export async function checkAndAwardBadges(
  employeeId: string,
  organizationId: string,
  eventType: string,
  trainingId?: string
): Promise<any[]> {
  const awardedBadges = [];

  // Get all available badges for organization
  const { data: badges } = await supabase
    .from('badges')
    .select('*')
    .eq('organization_id', organizationId);

  // Get employee's existing badges
  const { data: employeeBadges } = await supabase
    .from('employee_badges')
    .select('badge_id')
    .eq('employee_id', employeeId);

  const existingBadgeIds = (employeeBadges || []).map((b) => b.badge_id);

  for (const badge of badges || []) {
    // Skip if already earned
    if (existingBadgeIds.includes(badge.id)) continue;

    let shouldAward = false;

    // Check criteria
    if (badge.criteria) {
      const criteria = badge.criteria as any;

      if (criteria.eventType === eventType) {
        // Count-based badges
        if (criteria.count) {
          const { data: events } = await supabase
            .from('points_events')
            .select('*', { count: 'exact' })
            .eq('employee_id', employeeId)
            .eq('event_type', eventType);

          shouldAward = (events?.length || 0) >= criteria.count;
        } else {
          // Simple event-based badges
          shouldAward = true;
        }
      }

      // Level-based badges
      if (criteria.level) {
        const { currentLevel } = await getEmployeeCurrentLevel(
          employeeId,
          organizationId
        );
        shouldAward = currentLevel?.name === criteria.level;
      }
    }

    if (shouldAward) {
      const { data: newBadge, error } = await supabase
        .from('employee_badges')
        .insert([
          {
            employee_id: employeeId,
            badge_id: badge.id,
            earned_at: new Date(),
          },
        ])
        .select()
        .single();

      if (!error && newBadge) {
        awardedBadges.push(badge);
      }
    }
  }

  return awardedBadges;
}

/**
 * Get employee's gamification status
 */
export async function getEmployeeGamificationStatus(
  employeeId: string,
  organizationId: string
) {
  const totalPoints = await getEmployeeTotalPoints(employeeId);
  const { currentLevel } = await getEmployeeCurrentLevel(employeeId, organizationId);

  const { data: badges } = await supabase
    .from('employee_badges')
    .select('badge:badges(*)')
    .eq('employee_id', employeeId);

  const { data: history } = await supabase
    .from('employee_level_history')
    .select('*')
    .eq('employee_id', employeeId)
    .order('achieved_at', { ascending: false });

  const nextLevel =
    (currentLevel?.position || 0) < 6
      ? await supabase
          .from('knowledge_levels')
          .select('*')
          .eq('organization_id', organizationId)
          .eq('position', (currentLevel?.position || 0) + 1)
          .single()
          .then((r) => r.data)
      : null;

  const pointsToNextLevel = nextLevel
    ? nextLevel.min_points - totalPoints
    : 0;

  return {
    totalPoints,
    currentLevel,
    nextLevel,
    pointsToNextLevel,
    badges: badges || [],
    history: history || [],
  };
}
