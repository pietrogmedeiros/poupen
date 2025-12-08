import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // Se não passar email, buscar todos os usuários
    let query = supabase.from('users').select('id, email, name');

    if (email) {
      query = query.eq('email', email);
    }

    const { data, error } = await query;

    console.log('Debug Query Result:', { email, dataLength: data?.length, data, error });

    return NextResponse.json({
      email,
      data,
      error: error ? error.message : null,
      errorCode: error?.code
    });
  } catch (error) {
    console.error('Erro:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar usuário' },
      { status: 500 }
    );
  }
}
