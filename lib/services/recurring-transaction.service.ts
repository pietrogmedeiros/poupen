import { supabase } from '@/lib/supabase';
import { RecurringTransaction, ApiResponse } from '@/lib/types';
import { handleError, createSuccessResponse } from '@/lib/error-handler';

export async function getRecurringTransactions(
  userId: string
): Promise<ApiResponse<RecurringTransaction[]>> {
  try {
    const { data, error } = await supabase
      .from('recurring_transactions')
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return createSuccessResponse<RecurringTransaction[]>(data || []);
  } catch (error) {
    const { message } = handleError(error);
    return { success: false, error: message, data: [] };
  }
}

export async function createRecurringTransaction(
  userId: string,
  transaction: Omit<RecurringTransaction, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'deleted_at'>
): Promise<ApiResponse<RecurringTransaction>> {
  try {
    const { data, error } = await supabase
      .from('recurring_transactions')
      .insert({
        user_id: userId,
        ...transaction,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return createSuccessResponse<RecurringTransaction>(data);
  } catch (error) {
    const { message } = handleError(error);
    return { success: false, error: message };
  }
}

export async function updateRecurringTransaction(
  userId: string,
  transactionId: string,
  updates: Partial<Omit<RecurringTransaction, 'id' | 'user_id' | 'created_at' | 'deleted_at'>>
): Promise<ApiResponse<RecurringTransaction>> {
  try {
    const { data, error } = await supabase
      .from('recurring_transactions')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', transactionId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    return createSuccessResponse<RecurringTransaction>(data);
  } catch (error) {
    const { message } = handleError(error);
    return { success: false, error: message };
  }
}

export async function deleteRecurringTransaction(
  userId: string,
  transactionId: string
): Promise<ApiResponse<void>> {
  try {
    const { error } = await supabase
      .from('recurring_transactions')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', transactionId)
      .eq('user_id', userId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    const { message } = handleError(error);
    return { success: false, error: message };
  }
}
