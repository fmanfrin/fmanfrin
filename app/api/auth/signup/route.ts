import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { organization, admin } = body;

    if (!organization?.name || !admin?.name || !admin?.email || !admin?.password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 1. Create organization first
    const { data: orgData, error: orgError } = await supabase
      .from('organizations')
      .insert([{
        name: organization.name,
        status: 'active',
        plan: organization.plan || 'basic',
      }])
      .select()
      .single();

    if (orgError) {
      return NextResponse.json(
        { error: 'Failed to create organization: ' + orgError.message },
        { status: 400 }
      );
    }

    // 2. Try to create auth user via REST API
    const authResponse = await fetch(`${supabaseUrl}/auth/v1/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
      },
      body: JSON.stringify({
        email: admin.email,
        password: admin.password,
        user_metadata: {
          name: admin.name,
        },
      }),
    });

    if (!authResponse.ok) {
      const authError = await authResponse.json();
      console.error('Auth API error:', authError);
      return NextResponse.json(
        { error: 'Failed to create user account. Please try again.' },
        { status: 400 }
      );
    }

    const authData = await authResponse.json();
    const userId = authData.user?.id || authData.id;

    if (!userId) {
      return NextResponse.json(
        { error: 'Failed to create user: No user ID returned' },
        { status: 400 }
      );
    }

    // 3. Create profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert([{
        id: userId,
        email: admin.email,
        full_name: admin.name,
      }])
      .select()
      .single();

    if (profileError) {
      return NextResponse.json(
        { error: 'Failed to create profile: ' + profileError.message },
        { status: 400 }
      );
    }

    // 4. Create membership with admin_company role
    const { data: membershipData, error: membershipError } = await supabase
      .from('memberships')
      .insert([{
        profile_id: userId,
        organization_id: orgData.id,
        role: 'admin_company',
      }])
      .select()
      .single();

    if (membershipError) {
      return NextResponse.json(
        { error: 'Failed to create membership: ' + membershipError.message },
        { status: 400 }
      );
    }

    // Store organization ID in session/cookie for demo purposes
    return NextResponse.json(
      {
        message: 'Account created successfully!',
        redirect: '/dashboard',
        user: {
          id: userId,
          email: admin.email,
          name: admin.name,
        },
        organization: orgData,
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
