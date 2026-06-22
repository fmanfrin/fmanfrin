/**
 * Reporting Service
 * Generates various reports in CSV format
 */

import { supabase } from '../supabase';

export type ReportType =
  | 'employee_performance'
  | 'training_performance'
  | 'department_performance'
  | 'ranking'
  | 'points_history'
  | 'badges_earned'
  | 'completion_rate';

export interface ReportFilters {
  reportType: ReportType;
  organizationId: string;
  departmentId?: string;
  period?: 'all' | 'month' | 'quarter' | 'year';
  startDate?: Date;
  endDate?: Date;
  sortBy?: string;
}

/**
 * Generate employee performance report
 */
export async function generateEmployeePerformanceReport(
  organizationId: string,
  filters?: {
    departmentId?: string;
    startDate?: Date;
    endDate?: Date;
  }
) {
  const { data: employees } = await supabase
    .from('employees')
    .select('id, full_name, department:departments(name), status')
    .eq('organization_id', organizationId)
    .eq('status', 'active');

  if (!employees) return [];

  const report = await Promise.all(
    (employees || []).map(async (emp: any) => {
      // Get points
      const { data: pointsEvents } = await supabase
        .from('points_events')
        .select('points')
        .eq('employee_id', emp.id);

      const totalPoints = (pointsEvents || []).reduce((sum, e) => sum + (e.points || 0), 0);

      // Get attempts
      const { data: attempts } = await supabase
        .from('training_attempts')
        .select('score, max_score, status')
        .eq('employee_id', emp.id)
        .eq('status', 'submitted');

      const avgScore =
        attempts && attempts.length > 0
          ? attempts.reduce((sum, a) => sum + ((a.score || 0) / (a.max_score || 100)) * 100, 0) /
            attempts.length
          : 0;

      // Get badges
      const { data: badges } = await supabase
        .from('employee_badges')
        .select('*', { count: 'exact', head: true })
        .eq('employee_id', emp.id);

      return {
        nome: emp.full_name,
        area: emp.department?.name || 'N/A',
        pontos: totalPoints,
        treinamentos_completos: attempts?.length || 0,
        media_desempenho: Math.round(avgScore),
        badges: badges?.count || 0,
        status: emp.status,
      };
    })
  );

  return report;
}

/**
 * Generate training performance report
 */
export async function generateTrainingPerformanceReport(organizationId: string) {
  const { data: trainings } = await supabase
    .from('trainings')
    .select('id, title, status')
    .eq('organization_id', organizationId);

  if (!trainings) return [];

  const report = await Promise.all(
    (trainings || []).map(async (training: any) => {
      const { data: attempts } = await supabase
        .from('training_attempts')
        .select('score, max_score, status, completed_at')
        .eq('training_id', training.id)
        .eq('status', 'submitted');

      const avgScore =
        attempts && attempts.length > 0
          ? attempts.reduce((sum, a) => sum + ((a.score || 0) / (a.max_score || 100)) * 100, 0) /
            attempts.length
          : 0;

      const approvalRate =
        attempts && attempts.length > 0
          ? (attempts.filter((a) => ((a.score || 0) / (a.max_score || 100)) * 100 >= 70).length /
              attempts.length) *
            100
          : 0;

      const avgTime =
        attempts && attempts.length > 0
          ? attempts.reduce((sum, a) => {
              // Placeholder - would need start time
              return sum + 45; // 45 minutes average
            }, 0) / attempts.length
          : 0;

      return {
        titulo: training.title,
        status: training.status,
        conclusoes: attempts?.length || 0,
        media_desempenho: Math.round(avgScore),
        taxa_aprovacao: Math.round(approvalRate),
        tempo_medio_minutos: Math.round(avgTime),
      };
    })
  );

  return report;
}

/**
 * Generate ranking report
 */
export async function generateRankingReport(organizationId: string) {
  const { data: employees } = await supabase
    .from('employees')
    .select('id, full_name, department:departments(name)')
    .eq('organization_id', organizationId)
    .eq('status', 'active');

  if (!employees) return [];

  const rankings = await Promise.all(
    (employees || []).map(async (emp: any) => {
      const { data: pointsEvents } = await supabase
        .from('points_events')
        .select('points')
        .eq('employee_id', emp.id);

      const totalPoints = (pointsEvents || []).reduce((sum, e) => sum + (e.points || 0), 0);

      return {
        nome: emp.full_name,
        area: emp.department?.name || 'N/A',
        pontos: totalPoints,
      };
    })
  );

  // Sort by points
  rankings.sort((a, b) => b.pontos - a.pontos);

  // Add position
  return rankings.map((r, idx) => ({
    posicao: idx + 1,
    ...r,
  }));
}

/**
 * Generate points history report
 */
export async function generatePointsHistoryReport(
  organizationId: string,
  filters?: {
    employeeId?: string;
    startDate?: Date;
    endDate?: Date;
  }
) {
  let query = supabase
    .from('points_events')
    .select('employee:employees(full_name), event_type, points, description, created_at')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false });

  if (filters?.employeeId) {
    query = query.eq('employee_id', filters.employeeId);
  }

  const { data } = await query.limit(1000);

  return (data || []).map((e: any) => ({
    colaborador: e.employee?.full_name || 'Desconhecido',
    tipo_evento: e.event_type,
    pontos: e.points,
    descricao: e.description,
    data: new Date(e.created_at).toLocaleDateString('pt-BR'),
  }));
}

/**
 * Generate badges earned report
 */
export async function generateBadgesEarnedReport(organizationId: string) {
  const { data: badgeHistory } = await supabase
    .from('employee_badges')
    .select(
      'employee:employees(full_name, department:departments(name)), badge:badges(name, description), earned_at'
    )
    .order('earned_at', { ascending: false });

  if (!badgeHistory) return [];

  return (badgeHistory || []).map((b: any) => ({
    colaborador: b.employee?.full_name || 'Desconhecido',
    area: b.employee?.department?.name || 'N/A',
    badge: b.badge?.name,
    descricao: b.badge?.description,
    data_conquista: new Date(b.earned_at).toLocaleDateString('pt-BR'),
  }));
}

/**
 * Generate completion rate report
 */
export async function generateCompletionRateReport(organizationId: string) {
  const { data: trainings } = await supabase
    .from('trainings')
    .select('id, title')
    .eq('organization_id', organizationId)
    .eq('status', 'published');

  const { data: totalAssignments } = await supabase
    .from('training_assignments')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', organizationId);

  if (!trainings) return [];

  const report = await Promise.all(
    (trainings || []).map(async (training: any) => {
      // Get assignments for this training
      const { data: assignments } = await supabase
        .from('training_assignments')
        .select('*', { count: 'exact', head: true })
        .eq('training_id', training.id);

      // Get completed
      const { data: completed } = await supabase
        .from('training_attempts')
        .select('*', { count: 'exact', head: true })
        .eq('training_id', training.id)
        .eq('status', 'submitted');

      const total = assignments?.count || 0;
      const completedCount = completed?.count || 0;
      const rate = total > 0 ? Math.round((completedCount / total) * 100) : 0;

      return {
        treinamento: training.title,
        atribuidos: total,
        completados: completedCount,
        pendentes: total - completedCount,
        taxa_conclusao_percentual: rate,
      };
    })
  );

  return report;
}

/**
 * Export data to CSV
 */
export function exportToCSV(data: any[], filename: string): string {
  if (data.length === 0) return '';

  // Get headers
  const headers = Object.keys(data[0]);

  // Create CSV content
  const csvContent = [
    headers.join(','),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          // Escape quotes and wrap in quotes if contains comma
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        })
        .join(',')
    ),
  ].join('\n');

  return csvContent;
}

/**
 * Generate report based on type
 */
export async function generateReport(filters: ReportFilters) {
  let data: any[] = [];

  switch (filters.reportType) {
    case 'employee_performance':
      data = await generateEmployeePerformanceReport(filters.organizationId, {
        departmentId: filters.departmentId,
        startDate: filters.startDate,
        endDate: filters.endDate,
      });
      break;

    case 'training_performance':
      data = await generateTrainingPerformanceReport(filters.organizationId);
      break;

    case 'ranking':
      data = await generateRankingReport(filters.organizationId);
      break;

    case 'points_history':
      data = await generatePointsHistoryReport(filters.organizationId, {
        startDate: filters.startDate,
        endDate: filters.endDate,
      });
      break;

    case 'badges_earned':
      data = await generateBadgesEarnedReport(filters.organizationId);
      break;

    case 'completion_rate':
      data = await generateCompletionRateReport(filters.organizationId);
      break;

    default:
      throw new Error('Unknown report type');
  }

  return data;
}
