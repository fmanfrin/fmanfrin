/**
 * Dashboard Service
 * Calculates KPIs and statistics for dashboards
 */

import { supabase } from '../supabase';

export interface DashboardKPIs {
  totalEmployees: number;
  activeEmployees: number;
  totalTrainings: number;
  publishedTrainings: number;
  completedTrainings: number;
  avgCompletionRate: number;
  avgApprovalRate: number;
  totalPoints: number;
  usersWithPoints: number;
  avgUserPoints: number;
  activeCompetitions: number;
  endedCompetitions: number;
}

/**
 * Get dashboard KPIs for organization
 */
export async function getOrganizationDashboardKPIs(organizationId: string): Promise<DashboardKPIs> {
  // Total employees
  const { data: employeeCount } = await supabase
    .from('employees')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', organizationId)
    .eq('status', 'active');

  // Active employees (those with training attempts)
  const { data: activeEmployees } = await supabase
    .from('training_attempts')
    .select('employee_id')
    .eq('organization_id', organizationId)
    .then((r) => ({
      data: [...new Set((r.data || []).map((e: any) => e.employee_id))],
    }));

  // Total trainings
  const { data: trainings } = await supabase
    .from('trainings')
    .select('status')
    .eq('organization_id', organizationId);

  const publishedCount = (trainings || []).filter((t) => t.status === 'published').length;

  // Training attempts
  const { data: attempts } = await supabase
    .from('training_attempts')
    .select('score, max_score, status')
    .eq('organization_id', organizationId)
    .eq('status', 'submitted');

  const completedCount = attempts?.length || 0;
  const avgCompletion = (completedCount / Math.max(1, (trainings?.length || 0))) * 100;
  const avgApproval =
    attempts && attempts.length > 0
      ? (attempts.filter((a) => ((a.score || 0) / (a.max_score || 100)) * 100 >= 70).length /
          attempts.length) *
        100
      : 0;

  // Points
  const { data: pointsEvents } = await supabase
    .from('points_events')
    .select('employee_id, points')
    .eq('organization_id', organizationId);

  const totalPoints = (pointsEvents || []).reduce((sum, e) => sum + (e.points || 0), 0);
  const usersWithPoints = [...new Set((pointsEvents || []).map((e) => e.employee_id))].length;
  const avgUserPoints = usersWithPoints > 0 ? totalPoints / usersWithPoints : 0;

  // Competitions
  const { data: competitions } = await supabase
    .from('competitions')
    .select('status')
    .eq('organization_id', organizationId);

  const activeCompCount = (competitions || []).filter((c) => c.status === 'active').length;
  const endedCompCount = (competitions || []).filter((c) => c.status === 'ended').length;

  return {
    totalEmployees: employeeCount ? employeeCount.count || 0 : 0,
    activeEmployees: activeEmployees?.length || 0,
    totalTrainings: trainings?.length || 0,
    publishedTrainings: publishedCount,
    completedTrainings: completedCount,
    avgCompletionRate: Math.round(avgCompletion),
    avgApprovalRate: Math.round(avgApproval),
    totalPoints,
    usersWithPoints,
    avgUserPoints: Math.round(avgUserPoints),
    activeCompetitions: activeCompCount,
    endedCompetitions: endedCompCount,
  };
}

/**
 * Get training performance data for charts
 */
export async function getTrainingPerformance(organizationId: string) {
  const { data: trainings } = await supabase
    .from('trainings')
    .select('id, title')
    .eq('organization_id', organizationId)
    .eq('status', 'published')
    .limit(10);

  if (!trainings || trainings.length === 0) return [];

  const performance = await Promise.all(
    trainings.map(async (training) => {
      const { data: attempts } = await supabase
        .from('training_attempts')
        .select('score, max_score')
        .eq('training_id', training.id)
        .eq('status', 'submitted');

      const avgScore =
        attempts && attempts.length > 0
          ? attempts.reduce((sum, a) => sum + ((a.score || 0) / (a.max_score || 100)) * 100, 0) /
            attempts.length
          : 0;

      return {
        name: training.title,
        avgScore: Math.round(avgScore),
        completions: attempts?.length || 0,
      };
    })
  );

  return performance;
}

/**
 * Get level distribution
 */
export async function getLevelDistribution(organizationId: string) {
  const { data: levels } = await supabase
    .from('knowledge_levels')
    .select('name')
    .eq('organization_id', organizationId)
    .order('position', { ascending: true });

  if (!levels || levels.length === 0) {
    return [
      { name: 'Iniciante', value: 0 },
      { name: 'Aprendiz', value: 0 },
      { name: 'Desenvolvedor', value: 0 },
      { name: 'Especialista', value: 0 },
      { name: 'Mestre', value: 0 },
      { name: 'Elite', value: 0 },
    ];
  }

  const distribution = await Promise.all(
    levels.map(async (level) => {
      const { data: employees } = await supabase
        .from('employee_level_history')
        .select('*', { count: 'exact', head: true })
        .eq('level_id', level.name);

      return {
        name: level.name,
        value: employees?.count || 0,
      };
    })
  );

  return distribution;
}

/**
 * Get employee dashboard data
 */
export async function getEmployeeDashboardData(employeeId: string) {
  const { data: employee } = await supabase
    .from('employees')
    .select('*')
    .eq('id', employeeId)
    .single();

  // Points and level
  const { data: pointsEvents } = await supabase
    .from('points_events')
    .select('points, created_at')
    .eq('employee_id', employeeId)
    .order('created_at', { ascending: true });

  const totalPoints = (pointsEvents || []).reduce((sum, e) => sum + (e.points || 0), 0);

  // Training attempts
  const { data: attempts } = await supabase
    .from('training_attempts')
    .select('score, max_score, completed_at, status')
    .eq('employee_id', employeeId)
    .order('completed_at', { ascending: true });

  const completedCount = (attempts || []).filter((a) => a.status === 'submitted').length;
  const avgScore =
    attempts && attempts.length > 0
      ? attempts.reduce((sum, a) => sum + ((a.score || 0) / (a.max_score || 100)) * 100, 0) /
        attempts.length
      : 0;

  // Badges
  const { data: badges } = await supabase
    .from('employee_badges')
    .select('*', { count: 'exact', head: true })
    .eq('employee_id', employeeId);

  // Points by month (last 6 months)
  const today = new Date();
  const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 6, today.getDate());

  const pointsByMonth = Array.from({ length: 6 }, (_, i) => {
    const month = new Date(sixMonthsAgo);
    month.setMonth(month.getMonth() + i);
    const monthStr = month.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });

    const monthPoints = (pointsEvents || [])
      .filter((e) => {
        const eventDate = new Date(e.created_at);
        return (
          eventDate.getMonth() === month.getMonth() && eventDate.getFullYear() === month.getFullYear()
        );
      })
      .reduce((sum, e) => sum + (e.points || 0), 0);

    return {
      month: monthStr,
      points: monthPoints,
    };
  });

  return {
    employee,
    totalPoints,
    completedCount,
    avgScore: Math.round(avgScore),
    badgesCount: badges?.count || 0,
    pointsByMonth,
  };
}

/**
 * Get department dashboard data
 */
export async function getDepartmentDashboardData(departmentId: string) {
  const { data: employees } = await supabase
    .from('employees')
    .select('id, full_name')
    .eq('department_id', departmentId)
    .eq('status', 'active');

  if (!employees || employees.length === 0) {
    return {
      employeeCount: 0,
      avgPoints: 0,
      avgScore: 0,
      completedCount: 0,
      topPerformers: [],
    };
  }

  const employeeIds = employees.map((e) => e.id);

  // Get stats
  const { data: pointsEvents } = await supabase
    .from('points_events')
    .select('employee_id, points')
    .in('employee_id', employeeIds);

  const { data: attempts } = await supabase
    .from('training_attempts')
    .select('employee_id, score, max_score')
    .in('employee_id', employeeIds)
    .eq('status', 'submitted');

  const totalPoints = (pointsEvents || []).reduce((sum, e) => sum + (e.points || 0), 0);
  const avgPoints = employees.length > 0 ? Math.round(totalPoints / employees.length) : 0;

  const avgScore =
    attempts && attempts.length > 0
      ? Math.round(
          attempts.reduce((sum, a) => sum + ((a.score || 0) / (a.max_score || 100)) * 100, 0) /
            attempts.length
        )
      : 0;

  // Top performers
  const performerStats = employees.map((emp) => {
    const empPoints = (pointsEvents || [])
      .filter((e) => e.employee_id === emp.id)
      .reduce((sum, e) => sum + (e.points || 0), 0);

    return {
      name: emp.full_name,
      points: empPoints,
    };
  });

  performerStats.sort((a, b) => b.points - a.points);

  return {
    employeeCount: employees.length,
    avgPoints,
    avgScore,
    completedCount: attempts?.length || 0,
    topPerformers: performerStats.slice(0, 5),
  };
}
