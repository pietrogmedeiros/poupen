import { supabase } from '@/lib/supabase';
import { User, UserProfile, ApiResponse } from '@/lib/types';
import { handleError, createSuccessResponse } from '@/lib/error-handler';
import * as bcrypt from 'bcryptjs';
import { BCRYPT_CONFIG } from '@/lib/constants';

export async function getUserProfile(userId: string): Promise<ApiResponse<UserProfile>> {
  try {
    const { data, error } = await (supabase
      .from('users')
      .select('*')
      .eq('id', userId) as any)
      .single();

    if (error) throw error;

    return createSuccessResponse<UserProfile>(data);
  } catch (error) {
    const { message } = handleError(error);
    return { success: false, error: message };
  }
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<Omit<User, 'id' | 'created_at'>>
): Promise<ApiResponse<User>> {
  try {
    const updateData = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    // @ts-ignore - Supabase typing issue
    const { data, error } = await (supabase
      .from('users')
      // @ts-ignore
      .update(updateData)
      .eq('id', userId) as any)
      .select()
      .single();

    if (error) throw error;

    return createSuccessResponse<User>(data);
  } catch (error) {
    const { message } = handleError(error);
    return { success: false, error: message };
  }
}

export async function updatePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<ApiResponse<void>> {
  try {
    // Buscar usuário atual
    const { data: user, error: userError } = await (supabase
      .from('users')
      .select('password_hash')
      .eq('id', userId) as any)
      .single();

    if (userError) throw userError;
    if (!user?.password_hash) throw new Error('Usuário não encontrado');

    // Verificar senha atual
    const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password_hash as string);
    if (!isPasswordCorrect) {
      return {
        success: false,
        error: 'Senha atual incorreta',
      };
    }

    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(newPassword, BCRYPT_CONFIG.ROUNDS);

    // Atualizar senha
    // @ts-ignore - Supabase typing issue
    const { error: updateError } = await (supabase
      .from('users')
      // @ts-ignore
      .update({
        password_hash: hashedPassword,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId) as any);

    if (updateError) throw updateError;

    return { success: true };
  } catch (error) {
    const { message } = handleError(error);
    return { success: false, error: message };
  }
}
