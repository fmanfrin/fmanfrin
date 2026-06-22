import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { organization, admin } = await request.json();

    if (!organization?.name || !admin?.email || !admin?.password) {
      return NextResponse.json(
        { error: 'Dados incompletos' },
        { status: 400 }
      );
    }

    // 1. Create organization
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .insert({
        name: organization.name,
        cnpj: organization.cnpj || null,
        plan: organization.plan || 'basic',
        status: 'active',
      })
      .select()
      .single();

    if (orgError) {
      return NextResponse.json(
        { error: 'Erro ao criar organização' },
        { status: 400 }
      );
    }

    // 2. Create admin user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: admin.email,
      password: admin.password,
      options: {
        data: {
          full_name: admin.name,
        },
      },
    });

    if (authError) {
      // Delete organization if signup fails
      await supabase.from('organizations').delete().eq('id', org.id);
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Erro ao criar usuário' },
        { status: 500 }
      );
    }

    // 3. Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        email: authData.user.email,
        full_name: admin.name,
      });

    if (profileError) {
      return NextResponse.json(
        { error: 'Erro ao criar perfil' },
        { status: 400 }
      );
    }

    // 4. Create membership (admin_company role)
    const { error: membershipError } = await supabase
      .from('memberships')
      .insert({
        profile_id: authData.user.id,
        organization_id: org.id,
        role: 'admin_company',
      });

    if (membershipError) {
      return NextResponse.json(
        { error: 'Erro ao criar membership' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      organizationId: org.id,
      userId: authData.user.id,
      message: 'Conta criada com sucesso!',
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
