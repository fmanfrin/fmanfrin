/**
 * Audit Log Service
 * Tracks all important actions for security and compliance (LGPD)
 */

import { supabase } from '../supabase';

export type AuditAction =
  | 'login_success'
  | 'login_failed'
  | 'logout'
  | 'signup'
  | 'password_reset'
  | 'password_changed'
  | 'employee_created'
  | 'employee_updated'
  | 'employee_deleted'
  | 'training_created'
  | 'training_published'
  | 'training_deleted'
  | 'training_attempt_started'
  | 'training_attempt_submitted'
  | 'content_uploaded'
  | 'content_deleted'
  | 'competition_created'
  | 'competition_ended'
  | 'report_generated'
  | 'role_changed'
  | 'permission_denied'
  | 'data_export';

export interface AuditLogEntry {
  organizationId: string;
  userId?: string;
  employeeId?: string;
  action: AuditAction;
  resourceType?: string;
  resourceId?: string;
  ipAddress?: string;
  userAgent?: string;
  changes?: Record<string, any>;
  description?: string;
  status: 'success' | 'failed';
  timestamp: Date;
}

/**
 * Log an audit event
 */
export async function logAuditEvent(entry: AuditLogEntry): Promise<void> {
  try {
    const { error } = await supabase.from('audit_logs').insert([
      {
        organization_id: entry.organizationId,
        user_id: entry.userId,
        employee_id: entry.employeeId,
        action: entry.action,
        resource_type: entry.resourceType,
        resource_id: entry.resourceId,
        ip_address: entry.ipAddress,
        user_agent: entry.userAgent,
        changes: entry.changes,
        description: entry.description,
        status: entry.status,
        created_at: entry.timestamp,
      },
    ]);

    if (error) {
      console.error('Failed to log audit event:', error);
    }
  } catch (err) {
    console.error('Error logging audit event:', err);
  }
}

/**
 * Log login attempt
 */
export async function logLoginAttempt(
  organizationId: string,
  email: string,
  success: boolean,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await logAuditEvent({
    organizationId,
    action: success ? 'login_success' : 'login_failed',
    description: `Login attempt for ${email}`,
    status: success ? 'success' : 'failed',
    ipAddress,
    userAgent,
    timestamp: new Date(),
  });
}

/**
 * Log data export
 */
export async function logDataExport(
  organizationId: string,
  userId: string,
  dataType: string,
  recordCount: number,
  ipAddress?: string
): Promise<void> {
  await logAuditEvent({
    organizationId,
    userId,
    action: 'data_export',
    resourceType: dataType,
    description: `Exported ${recordCount} records of type ${dataType}`,
    changes: { recordCount, dataType },
    status: 'success',
    ipAddress,
    timestamp: new Date(),
  });
}

/**
 * Log permission denied
 */
export async function logPermissionDenied(
  organizationId: string,
  userId: string | undefined,
  action: string,
  reason: string,
  ipAddress?: string
): Promise<void> {
  await logAuditEvent({
    organizationId,
    userId,
    action: 'permission_denied',
    description: `Permission denied: ${reason}`,
    changes: { attemptedAction: action },
    status: 'failed',
    ipAddress,
    timestamp: new Date(),
  });
}

/**
 * Log employee action
 */
export async function logEmployeeAction(
  organizationId: string,
  userId: string,
  action: Extract<AuditAction, 'employee_created' | 'employee_updated' | 'employee_deleted'>,
  employeeId: string,
  changes?: Record<string, any>
): Promise<void> {
  await logAuditEvent({
    organizationId,
    userId,
    employeeId,
    action,
    resourceType: 'employee',
    resourceId: employeeId,
    changes,
    status: 'success',
    timestamp: new Date(),
  });
}

/**
 * Log training action
 */
export async function logTrainingAction(
  organizationId: string,
  userId: string,
  action: Extract<AuditAction, 'training_created' | 'training_published' | 'training_deleted'>,
  trainingId: string,
  trainingTitle?: string
): Promise<void> {
  await logAuditEvent({
    organizationId,
    userId,
    action,
    resourceType: 'training',
    resourceId: trainingId,
    description: trainingTitle ? `${action} training: ${trainingTitle}` : undefined,
    status: 'success',
    timestamp: new Date(),
  });
}

/**
 * Get audit logs for organization
 */
export async function getAuditLogs(
  organizationId: string,
  filters?: {
    action?: AuditAction;
    userId?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }
) {
  let query = supabase
    .from('audit_logs')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false });

  if (filters?.action) {
    query = query.eq('action', filters.action);
  }

  if (filters?.userId) {
    query = query.eq('user_id', filters.userId);
  }

  if (filters?.startDate) {
    query = query.gte('created_at', filters.startDate.toISOString());
  }

  if (filters?.endDate) {
    query = query.lte('created_at', filters.endDate.toISOString());
  }

  const limit = filters?.limit || 100;
  const offset = filters?.offset || 0;

  const { data, error } = await query.range(offset, offset + limit - 1);

  if (error) throw error;
  return data || [];
}
