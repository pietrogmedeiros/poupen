import { supabase } from '@/lib/supabase';
import { Transaction, TransactionFilters, ApiResponse, PaginatedResponse } from '@/lib/types';
import { handleError, createSuccessResponse } from '@/lib/error-handler';
import { PAGINATION } from '@/lib/constants';

export interface GetTransactionsParams extends TransactionFilters {
  userId: string;
  page?: number;
  limit?: number;
}

export async function getTransactions(
  params: GetTransactionsParams
): Promise<ApiResponse<PaginatedResponse<Transaction>>> {
  try {
    const {
      userId,
      startDate,
      endDate,
      category,
      type,
      minAmount,
      maxAmount,
      page = PAGINATION.DEFAULT_PAGE,
      limit = PAGINATION.DEFAULT_LIMIT,
    } = params;

    // Validar limite máximo
    const finalLimit = Math.min(limit, PAGINATION.MAX_LIMIT);
    const offset = (page - 1) * finalLimit;

    let query = supabase
      .from('transactions')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('date', { ascending: false });

    // Aplicar filtros
    if (startDate) {
      query = query.gte('date', startDate);
    }
    if (endDate) {
      query = query.lte('date', endDate);
    }
    if (category) {
      query = query.eq('category', category);
    }
    if (type) {
      query = query.eq('type', type);
    }
    if (minAmount !== undefined) {
      query = query.gte('amount', minAmount);
    }
    if (maxAmount !== undefined) {
      query = query.lte('amount', maxAmount);
    }

    // Aplicar paginação
    query = query.range(offset, offset + finalLimit - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    const total = count || 0;
    const pages = Math.ceil(total / finalLimit);

    return createSuccessResponse<PaginatedResponse<Transaction>>({
      data: (data as Transaction[]) || [],
      total,
      page,
      limit: finalLimit,
      pages,
    });
  } catch (error) {
    const { message } = handleError(error);
    return {
      success: false,
      error: message,
      data: { data: [], total: 0, page: 1, limit: PAGINATION.DEFAULT_LIMIT, pages: 0 },
    };
  }
}

export async function createTransaction(
  userId: string,
  transaction: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'deleted_at'>
): Promise<ApiResponse<Transaction>> {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        ...transaction,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return createSuccessResponse<Transaction>(data);
  } catch (error) {
    const { message } = handleError(error);
    return { success: false, error: message };
  }
}

export async function updateTransaction(
  userId: string,
  transactionId: string,
  updates: Partial<Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'deleted_at'>>
): Promise<ApiResponse<Transaction>> {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', transactionId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    return createSuccessResponse<Transaction>(data);
  } catch (error) {
    const { message } = handleError(error);
    return { success: false, error: message };
  }
}

export async function deleteTransaction(
  userId: string,
  transactionId: string
): Promise<ApiResponse<void>> {
  try {
    const { error } = await supabase
      .from('transactions')
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

export async function getMonthlyStats(
  userId: string,
  month: string
): Promise<ApiResponse<{ income: number; expenses: number; balance: number }>> {
  try {
    const startDate = `${month}-01`;
    const endDate = new Date(parseInt(month.split('-')[0]), parseInt(month.split('-')[1]), 0)
      .toISOString()
      .split('T')[0];

    // Usar agregação no banco de dados em vez de filtrar em memory
    const { data: income, error: incomeError } = await supabase
      .from('transactions')
      .select('amount')
      .eq('user_id', userId)
      .eq('type', 'entrada')
      .gte('date', startDate)
      .lte('date', endDate)
      .is('deleted_at', null);

    if (incomeError) throw incomeError;

    const { data: expenses, error: expensesError } = await supabase
      .from('transactions')
      .select('amount')
      .eq('user_id', userId)
      .eq('type', 'despesa')
      .gte('date', startDate)
      .lte('date', endDate)
      .is('deleted_at', null);

    if (expensesError) throw expensesError;

    const totalIncome = (income || []).reduce((sum, t) => sum + (t.amount || 0), 0);
    const totalExpenses = (expenses || []).reduce((sum, t) => sum + (t.amount || 0), 0);

    return createSuccessResponse({
      income: totalIncome,
      expenses: totalExpenses,
      balance: totalIncome - totalExpenses,
    });
  } catch (error) {
    const { message } = handleError(error);
    return { success: false, error: message };
  }
}
