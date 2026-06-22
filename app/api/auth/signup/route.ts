import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { organization, admin } = body;

    if (!organization?.name || !admin?.email || !admin?.password || !admin?.name) {
      return NextResponse.json(
        { error: 'Campos obrigatórios faltando' },
        { status: 400 }
      );
    }

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: admin.email,
      password: admin.password,
      email_confirm: true,
    });

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    // Create organization
    const { data: orgData, error: orgError } = await supabase
      .from('organizations')
      .insert([
        {
          name: organization.name,
          plan: organization.plan || 'basic',
          status: 'active',
        },
      ])
      .select()
      .single();

    if (orgError) {
      return NextResponse.json(
        { error: orgError.message },
        { status: 400 }
      );
    }

    // Create membership (admin role)
    const { error: memberError } = await supabase
      .from('memberships')
      .insert([
        {
          profile_id: authData.user.id,
          organization_id: orgData.id,
          role: 'admin_company',
        },
      ]);

    if (memberError) {
      return NextResponse.json(
        { error: memberError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: 'Conta criada com sucesso',
      user: authData.user,
      organization: orgData,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao criar conta' },
      { status: 500 }
    );
  }
}
