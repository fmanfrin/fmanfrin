import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password required' },
        { status: 400 }
      );
    }

    // Try to sign in
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // If sign in fails because user doesn't exist, try to create user first
    if (signInError) {
      console.log('Sign in failed, trying to create user:', signInError.message);

      // Create user via REST API
      const createUserResponse = await fetch(`${supabaseUrl}/auth/v1/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseServiceKey,
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (!createUserResponse.ok) {
        const createError = await createUserResponse.json();
        console.error('Create user error:', createError);
      } else {
        console.log('User created, trying to sign in again');
        // Try signing in again
        const { data: retrySignIn, error: retryError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (retryError) {
          return NextResponse.json(
            { error: 'Invalid login credentials' },
            { status: 401 }
          );
        }

        return NextResponse.json(
          {
            message: 'Logged in successfully',
            user: retrySignIn.user,
            session: retrySignIn.session,
          },
          { status: 200 }
        );
      }

      return NextResponse.json(
        { error: 'Invalid login credentials' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        message: 'Logged in successfully',
        user: signInData.user,
        session: signInData.session,
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
