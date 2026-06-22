import { supabase } from './supabase';
import type { Profile, Membership, Organization, CurrentUser } from './types';

/**
 * Get current authenticated user session
 */
export async function getSession() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}

/**
 * Get current user's profile and memberships
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await getSession();
  if (!session?.user) return null;

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();

  if (profileError || !profile) return null;

  const { data: memberships, error: membershipsError } = await supabase
    .from('memberships')
    .select('*')
    .eq('profile_id', session.user.id);

  if (membershipsError) return null;

  return {
    profile: profile as Profile,
    memberships: (memberships || []) as Membership[],
  };
}

/**
 * Get user's current organization
 */
export async function getCurrentOrganization(
  organizationId: string
): Promise<Organization | null> {
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', organizationId)
    .single();

  if (error) {
    console.error('Error fetching organization:', error);
    return null;
  }

  return data as Organization;
}

/**
 * Sign up with email and password
 */
export async function signUp(email: string, password: string, fullName?: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) throw error;

  // Create profile
  if (data.user) {
    const { error: profileError } = await supabase.from('profiles').insert({
      id: data.user.id,
      email: data.user.email,
      full_name: fullName,
    });

    if (profileError) {
      console.error('Error creating profile:', profileError);
    }
  }

  return data;
}

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

/**
 * Sign out
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Request password reset
 */
export async function resetPassword(email: string) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
  });

  if (error) throw error;
  return data;
}

/**
 * Update password with token
 */
export async function updatePassword(password: string) {
  const { data, error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
  return data;
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return !!session;
}

/**
 * Get user's role in a specific organization
 */
export async function getUserRoleInOrganization(
  userId: string,
  organizationId: string
): Promise<string | null> {
  const { data, error } = await supabase
    .from('memberships')
    .select('role')
    .eq('profile_id', userId)
    .eq('organization_id', organizationId)
    .single();

  if (error) {
    console.error('Error fetching user role:', error);
    return null;
  }

  return data?.role || null;
}

/**
 * Check if user has a specific role in organization
 */
export async function hasRole(
  userId: string,
  organizationId: string,
  requiredRole: string | string[]
): Promise<boolean> {
  const role = await getUserRoleInOrganization(userId, organizationId);
  if (!role) return false;

  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(role);
  }
  return role === requiredRole;
}
