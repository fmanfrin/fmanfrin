// Database utilities and queries
import { supabase } from './supabase';

/**
 * Get organization by ID
 */
export async function getOrganization(organizationId: string) {
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', organizationId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Check if user has specific role in organization
 */
export async function hasRole(userId: string, role: string) {
  const { data, error } = await supabase
    .from('memberships')
    .select('role')
    .eq('profile_id', userId)
    .single();

  if (error) return false;
  return data?.role === role;
}

/**
 * Get employee by user ID
 */
export async function getEmployeeByUserId(userId: string) {
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw error;
  }

  return data;
}

/**
 * Get all employees for organization
 */
export async function getEmployees(organizationId: string, filters?: any) {
  let query = supabase
    .from('employees')
    .select('*', { count: 'exact' })
    .eq('organization_id', organizationId);

  if (filters?.departmentId) {
    query = query.eq('department_id', filters.departmentId);
  }

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  const page = filters?.page || 1;
  const limit = filters?.limit || 20;
  const start = (page - 1) * limit;

  const { data, error, count } = await query
    .range(start, start + limit - 1)
    .order('full_name');

  if (error) throw error;

  return {
    employees: data || [],
    total: count || 0,
    page,
    limit,
    pages: Math.ceil((count || 0) / limit),
  };
}

/**
 * Create employee
 */
export async function createEmployee(organizationId: string, employeeData: any) {
  const { data, error } = await supabase
    .from('employees')
    .insert([
      {
        organization_id: organizationId,
        ...employeeData,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update employee
 */
export async function updateEmployee(employeeId: string, updates: any) {
  const { data, error } = await supabase
    .from('employees')
    .update(updates)
    .eq('id', employeeId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get trainings for organization
 */
export async function getTrainings(organizationId: string, filters?: any) {
  let query = supabase
    .from('trainings')
    .select('*', { count: 'exact' })
    .eq('organization_id', organizationId);

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  const page = filters?.page || 1;
  const limit = filters?.limit || 20;
  const start = (page - 1) * limit;

  const { data, error, count } = await query
    .range(start, start + limit - 1)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return {
    trainings: data || [],
    total: count || 0,
    page,
    limit,
    pages: Math.ceil((count || 0) / limit),
  };
}

/**
 * Get training by ID
 */
export async function getTraining(trainingId: string) {
  const { data, error } = await supabase
    .from('trainings')
    .select('*')
    .eq('id', trainingId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Create training
 */
export async function createTraining(organizationId: string, trainingData: any) {
  const { data, error } = await supabase
    .from('trainings')
    .insert([
      {
        organization_id: organizationId,
        ...trainingData,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get training attempts
 */
export async function getTrainingAttempts(employeeId: string, organizationId: string, filters?: any) {
  let query = supabase
    .from('training_attempts')
    .select('training:trainings(*), *', { count: 'exact' })
    .eq('employee_id', employeeId);

  query = query.eq('training.organization_id', organizationId);

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  const page = filters?.page || 1;
  const limit = filters?.limit || 20;
  const start = (page - 1) * limit;

  const { data, error, count } = await query
    .range(start, start + limit - 1)
    .order('started_at', { ascending: false });

  if (error) throw error;

  return {
    trainings: data || [],
    total: count || 0,
    page,
    limit,
    pages: Math.ceil((count || 0) / limit),
  };
}
