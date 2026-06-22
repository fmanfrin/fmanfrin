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

    // 1. Create organization
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

    // 2. Create user via Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: admin.email,
      password: admin.password,
      email_confirm: true,
      user_metadata: {
        name: admin.name,
      },
    });

    if (authError) {
      return NextResponse.json(
        { error: 'Failed to create user: ' + authError.message },
        { status: 400 }
      );
    }

    // 3. Create profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert([{
        id: authData.user.id,
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
        profile_id: authData.user.id,
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

    return NextResponse.json(
      {
        message: 'Account created successfully',
        user: {
          id: authData.user.id,
          email: authData.user.email,
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
