import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são necessários' },
        { status: 400 }
      );
    }

    // Atualizar no banco com senha em plaintext
    const { error } = await supabase
      .from('users')
      .update({ password_hash: password })
      .eq('email', email);

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Senha atualizada' });
  } catch (error) {
    console.error('Erro:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar senha' },
      { status: 500 }
    );
  }
}
