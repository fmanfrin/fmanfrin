/**
 * Competition Service
 * Manages competitions, rankings, and prizes
 */

import { supabase } from '../supabase';
import { RankingEntry } from './ranking';

export interface CompetitionWithDetails {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  bannerUrl?: string;
  areaId?: string;
  startDate: Date;
  endDate: Date;
  criteria: string;
  validTrainingIds: string[];
  winnerCount: number;
  status: 'draft' | 'scheduled' | 'active' | 'ended';
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CompetitionRanking extends RankingEntry {
  participationDate?: Date;
}

/**
 * Create competition
 */
export async function createCompetition(
  organizationId: string,
  data: {
    name: string;
    description: string;
    bannerUrl?: string;
    areaId?: string;
    startDate: Date;
    endDate: Date;
    criteria: string;
    validTrainingIds: string[];
    winnerCount: number;
  }
) {
  const { data: competition, error } = await supabase
    .from('competitions')
    .insert([
      {
        organization_id: organizationId,
        name: data.name,
        description: data.description,
        banner_url: data.bannerUrl,
        area_id: data.areaId,
        start_date: data.startDate,
        end_date: data.endDate,
        criteria: data.criteria,
        valid_training_ids: data.validTrainingIds,
        winner_count: data.winnerCount,
        status: 'draft',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return competition;
}

/**
 * Get competitions for organization
 */
export async function listCompetitions(
  organizationId: string,
  filters?: {
    status?: string;
    areaId?: string;
  },
  limit: number = 10,
  offset: number = 0
) {
  let query = supabase
    .from('competitions')
    .select('*')
    .eq('organization_id', organizationId)
    .order('start_date', { ascending: false });

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  if (filters?.areaId) {
    query = query.eq('area_id', filters.areaId);
  }

  const { data, error } = await query.range(offset, offset + limit - 1);

  if (error) throw error;
  return data || [];
}

/**
 * Get competition by ID
 */
export async function getCompetition(id: string) {
  const { data, error } = await supabase
    .from('competitions')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update competition status
 */
export async function updateCompetitionStatus(
  competitionId: string,
  status: 'draft' | 'scheduled' | 'active' | 'ended'
) {
  const { data, error } = await supabase
    .from('competitions')
    .update({
      status,
      updated_at: new Date(),
    })
    .eq('id', competitionId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Add prize to competition
 */
export async function addPrize(competitionId: string, prize: any) {
  const { data, error } = await supabase
    .from('competition_prizes')
    .insert([
      {
        competition_id: competitionId,
        ...prize,
        created_at: new Date(),
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get prizes for competition
 */
export async function getPrizes(competitionId: string) {
  const { data, error } = await supabase
    .from('competition_prizes')
    .select('*')
    .eq('competition_id', competitionId)
    .order('position', { ascending: true });

  if (error) throw error;
  return data || [];
}

/**
 * Check if employee is participant
 */
export async function isParticipant(
  competitionId: string,
  employeeId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('competition_participants')
    .select('id')
    .eq('competition_id', competitionId)
    .eq('employee_id', employeeId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return !!data;
}

/**
 * Join competition
 */
export async function joinCompetition(competitionId: string, employeeId: string) {
  // Check if already participant
  const existing = await isParticipant(competitionId, employeeId);
  if (existing) {
    throw new Error('Already a participant');
  }

  const { data, error } = await supabase
    .from('competition_participants')
    .insert([
      {
        competition_id: competitionId,
        employee_id: employeeId,
        joined_at: new Date(),
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get competition ranking
 * Calculates ranking based on criteria
 */
export async function getCompetitionRanking(
  competitionId: string
): Promise<CompetitionRanking[]> {
  const competition = await getCompetition(competitionId);
  if (!competition) throw new Error('Competition not found');

  // Get participants
  const { data: participants } = await supabase
    .from('competition_participants')
    .select('employee:employees(id, full_name, department:departments(name))')
    .eq('competition_id', competitionId);

  if (!participants || participants.length === 0) return [];

  const rankings: CompetitionRanking[] = [];

  for (const p of participants) {
    const emp = p.employee as any;

    // Get training attempts for valid trainings during competition period
    const { data: attempts } = await supabase
      .from('training_attempts')
      .select('score, max_score, completed_at')
      .eq('employee_id', emp.id)
      .in('training_id', competition.valid_training_ids)
      .gte('completed_at', competition.start_date)
      .lte('completed_at', competition.end_date)
      .eq('status', 'submitted');

    if (!attempts || attempts.length === 0) continue;

    // Calculate score based on criteria
    let score = 0;

    switch (competition.criteria) {
      case 'largest_score':
        // Sum of all scores
        score = attempts.reduce((sum, a) => sum + ((a.score || 0) / (a.max_score || 100)) * 100, 0);
        break;

      case 'best_avg':
        // Average score
        score =
          attempts.reduce((sum, a) => sum + ((a.score || 0) / (a.max_score || 100)) * 100, 0) /
          attempts.length;
        break;

      case 'most_completed':
        // Number of trainings completed
        score = attempts.length * 100;
        break;

      case 'fastest':
        // Inverse of time taken (faster = higher score)
        const avgTime =
          attempts.reduce((sum, a) => {
            if (a.completed_at) {
              return sum + (new Date(a.completed_at).getTime() - new Date().getTime());
            }
            return sum;
          }, 0) / attempts.length;
        score = Math.max(0, 1000 - avgTime / 60000); // Convert ms to minutes
        break;

      case 'best_improvement':
        // Score increase from first to last
        if (attempts.length > 1) {
          const first = (attempts[0].score || 0) / (attempts[0].max_score || 100);
          const last =
            (attempts[attempts.length - 1].score || 0) /
            (attempts[attempts.length - 1].max_score || 100);
          score = (last - first) * 100;
        }
        break;
    }

    rankings.push({
      position: 0, // Will be set after sorting
      employeeId: emp.id,
      employeeName: emp.full_name,
      area: emp.department?.name || 'N/A',
      points: Math.round(score),
      level: '', // Not relevant for competition
      avgScore: Math.round(
        attempts.reduce((sum, a) => sum + ((a.score || 0) / (a.max_score || 100)) * 100, 0) /
          attempts.length
      ),
      trainingsCompleted: attempts.length,
      badges: 0, // Not relevant for competition
      participationDate: new Date(attempts[attempts.length - 1].completed_at),
    });
  }

  // Sort by points (descending)
  rankings.sort((a, b) => b.points - a.points);

  // Add positions
  rankings.forEach((r, idx) => {
    r.position = idx + 1;
  });

  return rankings;
}

/**
 * End competition and freeze ranking
 */
export async function endCompetition(competitionId: string) {
  // Get final ranking
  const ranking = await getCompetitionRanking(competitionId);

  // Freeze ranking snapshot
  for (const entry of ranking) {
    await supabase.from('competition_rank_snapshots').insert([
      {
        competition_id: competitionId,
        position: entry.position,
        employee_id: entry.employeeId,
        points: entry.points,
        created_at: new Date(),
      },
    ]);
  }

  // Update competition status
  await updateCompetitionStatus(competitionId, 'ended');

  return ranking;
}

/**
 * Award prizes to winners
 */
export async function awardPrizes(competitionId: string) {
  const ranking = await getCompetitionRanking(competitionId);
  const prizes = await getPrizes(competitionId);

  const awards = [];

  for (let i = 0; i < Math.min(ranking.length, prizes.length); i++) {
    const winner = ranking[i];
    const prize = prizes.find((p) => p.position === i + 1);

    if (prize) {
      awards.push({
        competition_id: competitionId,
        employee_id: winner.employeeId,
        position: i + 1,
        prize_id: prize.id,
        awarded_at: new Date(),
      });
    }
  }

  if (awards.length > 0) {
    const { error } = await supabase.from('competition_awards').insert(awards);
    if (error) throw error;
  }

  return awards;
}

/**
 * Get competition winners
 */
export async function getWinners(competitionId: string) {
  const { data, error } = await supabase
    .from('competition_rank_snapshots')
    .select('position, employee:employees(id, full_name)')
    .eq('competition_id', competitionId)
    .order('position', { ascending: true })
    .limit(3);

  if (error) throw error;
  return data || [];
}
