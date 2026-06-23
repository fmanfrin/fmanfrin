import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

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

    // Generate a UUID for the user
    const userId = randomUUID();

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

    // 2. Create profile (without Auth)
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

    // 3. Create membership with admin_company role
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

    return NextResponse.json(
      {
        message: 'Account created successfully! You can now log in.',
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
