import { supabase } from './supabase';

// ============================================================
// TRANSACTIONS - Operações de Entrada/Despesa
// ============================================================

export async function fetchTransactions(userId: string, type?: 'income' | 'expense') {
  try {
    let query = supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('date', { ascending: false });

    if (type) {
      query = query.eq('type', type);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar transações:', error);
    return [];
  }
}

export async function createTransaction(
  userId: string,
  transaction: {
    type: 'income' | 'expense';
    amount: number;
    category: string;
    description: string;
    date: string;
  }
) {
  try {
    // @ts-ignore
    // @ts-ignore
    const { data, error } = await supabase.from('transactions').insert([
      {
        user_id: userId,
        ...transaction,
      },
    ]);

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Erro ao criar transação:', error);
    return { success: false, error };
  }
}

export async function updateTransaction(
  transactionId: string,
  updates: Partial<{
    amount: number;
    category: string;
    description: string;
    date: string;
  }>
) {
  try {
    // @ts-ignore
    const { data, error } = await supabase
      .from('transactions')
      // @ts-ignore
      // @ts-ignore
      .update(updates)
      .eq('id', transactionId);

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Erro ao atualizar transação:', error);
    return { success: false, error };
  }
}

export async function deleteTransaction(transactionId: string) {
  try {
    // @ts-ignore
    const { error } = await supabase
      .from('transactions')
      // @ts-ignore
      // @ts-ignore
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', transactionId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Erro ao deletar transação:', error);
    return { success: false, error };
  }
}

// ============================================================
// MONTHLY SUMMARY - Resumo Mensal
// ============================================================

export async function fetchMonthlySummary(userId: string, month: number, year: number) {
  try {
    const { data, error } = await supabase
      .from('monthly_summary')
      .select('*')
      .eq('user_id', userId)
      .eq('month', month)
      .eq('year', year)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
    return data;
  } catch (error) {
    console.error('Erro ao buscar resumo mensal:', error);
    return null;
  }
}

export async function calculateMonthlyStats(userId: string, month: number, year: number) {
  try {
    const transactions = await fetchTransactions(userId);

    const filtered = transactions.filter((t: any) => {
      const date = new Date(t.date);
      return date.getMonth() + 1 === month && date.getFullYear() === year;
    });

    const totalIncome = filtered
      .filter((t: any) => t.type === 'income')
      .reduce((sum: number, t: any) => sum + parseFloat(t.amount), 0);

    const totalExpense = filtered
      .filter((t: any) => t.type === 'expense')
      .reduce((sum: number, t: any) => sum + parseFloat(t.amount), 0);

    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      count: filtered.length,
    };
  } catch (error) {
    console.error('Erro ao calcular stats:', error);
    return { totalIncome: 0, totalExpense: 0, balance: 0, count: 0 };
  }
}

// ============================================================
// USERS - Operações de Usuário
// ============================================================

export async function fetchUserProfile(userId: string) {
  try {
    // @ts-ignore - Supabase typing issue
    const { data, error } = await (supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .is('deleted_at', null) as any)
      .single();

    if (error) throw error;
    return data as any;
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    return null;
  }
}

export async function updateUserProfile(
  userId: string,
  updates: {
    name?: string;
    email?: string;
    phone?: string;
    avatar_url?: string;
  }
) {
  try {
    // @ts-ignore
    const { data, error } = await supabase
      .from('users')
      // @ts-ignore
      // @ts-ignore
      .update(updates)
      .eq('id', userId);

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    return { success: false, error };
  }
}

export async function updatePassword(userId: string, newPassword: string) {
  try {
    // Em produção, usar Supabase Auth ao invés de atualizar direto
    // Este é apenas um exemplo
    // @ts-ignore
    const { data, error } = await supabase
      .from('users')
      // @ts-ignore
      // @ts-ignore
      .update({ password_hash: newPassword })
      .eq('id', userId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Erro ao atualizar senha:', error);
    return { success: false, error };
  }
}

// ============================================================
// USER PREFERENCES - Preferências
// ============================================================

export async function fetchUserPreferences(userId: string) {
  try {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  } catch (error) {
    console.error('Erro ao buscar preferências:', error);
    return null;
  }
}

export async function updateUserPreferences(
  userId: string,
  preferences: {
    theme?: string;
    currency?: string;
    language?: string;
    notifications_enabled?: boolean;
  }
) {
  try {
    // @ts-ignore
    const { data, error } = await supabase
      .from('user_preferences')
      // @ts-ignore
      // @ts-ignore
      .upsert({
        user_id: userId,
        ...preferences,
      });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Erro ao atualizar preferências:', error);
    return { success: false, error };
  }
}

// ============================================================
// RECEIPTS - Comprovantes
// ============================================================

export async function uploadReceipt(
  userId: string,
  file: File,
  detectedAmount?: number,
  detectedCategory?: string
) {
  try {
    // Upload da imagem
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;

    const { data: storageData, error: storageError } = await supabase.storage
      .from('receipts')
      .upload(fileName, file);

    if (storageError) throw storageError;

    // Criar signed URL para arquivo privado
    const { data: signedData } = await supabase.storage
      .from('receipts')
      .createSignedUrl(fileName, 3600);

    // Inserir registro no banco
    // @ts-ignore
    const { data: dbData, error: dbError } = await supabase
      .from('receipts')
      // @ts-ignore
      // @ts-ignore
      .insert([
        {
          user_id: userId,
          image_url: signedData?.signedUrl || fileName,
          detected_amount: detectedAmount,
          detected_category: detectedCategory,
          processing_status: 'success',
        },
      ]);

    if (dbError) throw dbError;

    return { success: true, data: dbData };
  } catch (error) {
    console.error('Erro ao fazer upload do comprovante:', error);
    return { success: false, error };
  }
}

export async function fetchReceipts(userId: string) {
  try {
    const { data, error } = await supabase
      .from('receipts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar comprovantes:', error);
    return [];
  }
}

// ============================================================
// CATEGORIES - Categorias
// ============================================================

export async function fetchCategories(userId: string, type?: 'income' | 'expense') {
  try {
    let query = supabase
      .from('categories')
      .select('*')
      .eq('user_id', userId)
      .order('name');

    if (type) {
      query = query.eq('type', type);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    return [];
  }
}

export async function createCategory(
  userId: string,
  category: {
    name: string;
    type: 'income' | 'expense';
    color?: string;
    icon?: string;
  }
) {
  try {
    // @ts-ignore
    // @ts-ignore
    const { data, error } = await supabase.from('categories').insert([
      {
        user_id: userId,
        ...category,
      },
    ]);

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Erro ao criar categoria:', error);
    return { success: false, error };
  }
}

// ============================================================
// BUDGETS - Orçamentos
// ============================================================

export async function fetchBudgets(userId: string, month: number, year: number) {
  try {
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', userId)
      .eq('month', month)
      .eq('year', year);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar orçamentos:', error);
    return [];
  }
}

export async function createBudget(
  userId: string,
  budget: {
    category: string;
    month: number;
    year: number;
    limit_amount: number;
    alert_percentage?: number;
  }
) {
  try {
    // @ts-ignore
    const { data, error } = await supabase.from('budgets').insert([
      {
        user_id: userId,
        ...budget,
      },
    ]);

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Erro ao criar orçamento:', error);
    return { success: false, error };
  }
}

// ============================================================
// AUTH - Funções de autenticação auxiliares
// ============================================================

export async function updateUserPassword(userId: string, newPassword: string) {
  try {
    const encodedPassword = btoa(newPassword);
    const { error } = await supabase
      .from('users')
      // @ts-ignore
      .update({ password_hash: encodedPassword })
      .eq('id', userId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Erro ao atualizar senha:', error);
    return { success: false, error };
  }
}

// ============================================================
// RECURRING TRANSACTIONS - Operações de Transações Recorrentes
// ============================================================

export async function fetchRecurringTransactions(userId: string) {
  try {
    const { data, error } = await supabase
      .from('recurring_transactions')
      .select('*')
      .eq('user_id', userId)
      .eq('active', true)
      .is('deleted_at', null)
      .order('next_occurrence', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar transações recorrentes:', error);
    return [];
  }
}

export async function createRecurringTransaction(
  userId: string,
  data: {
    description: string;
    amount: number;
    category: string;
    type: 'income' | 'expense';
    frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly';
    start_date: string;
    end_date?: string;
    day_of_month?: number;
  }
) {
  try {
    // Calculate next occurrence
    const nextOccurrence = new Date(data.start_date);
    
    const { data: recurring, error } = await supabase
      .from('recurring_transactions')
      // @ts-ignore
      .insert([
        {
          user_id: userId,
          description: data.description,
          amount: parseFloat(data.amount.toString()),
          category: data.category,
          type: data.type,
          frequency: data.frequency,
          start_date: data.start_date,
          end_date: data.end_date || null,
          next_occurrence: nextOccurrence.toISOString().split('T')[0],
          day_of_month: data.day_of_month || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) throw error;
    return { success: true, data: recurring };
  } catch (error) {
    console.error('Erro ao criar transação recorrente:', error);
    return { success: false, error };
  }
}

export async function updateRecurringTransaction(
  recurringId: string,
  data: Partial<{
    description: string;
    amount: number;
    category: string;
    frequency: string;
    end_date: string;
    day_of_month: number;
    active: boolean;
  }>
) {
  try {
    const { error } = await supabase
      .from('recurring_transactions')
      // @ts-ignore
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', recurringId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Erro ao atualizar transação recorrente:', error);
    return { success: false, error };
  }
}

export async function deleteRecurringTransaction(recurringId: string) {
  try {
    const { error } = await supabase
      .from('recurring_transactions')
      // @ts-ignore
      .update({
        deleted_at: new Date().toISOString(),
      })
      .eq('id', recurringId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Erro ao deletar transação recorrente:', error);
    return { success: false, error };
  }
}

// ============================================================
// NOTIFICATIONS - Operações de Notificações
// ============================================================

export async function fetchNotifications(userId: string) {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar notificações:', error);
    return [];
  }
}

export async function fetchUnreadNotifications(userId: string) {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('read', false)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar notificações não lidas:', error);
    return [];
  }
}

export async function markNotificationAsRead(notificationId: string) {
  try {
    const { error } = await supabase
      .from('notifications')
      // @ts-ignore
      .update({ read: true })
      .eq('id', notificationId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Erro ao marcar notificação como lida:', error);
    return { success: false, error };
  }
}

export async function processRecurringTransactions() {
  try {
    const { data, error } = await supabase.rpc('process_recurring_transactions');

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Erro ao processar transações recorrentes:', error);
    return { success: false, error };
  }
}

export async function createReminderNotifications() {
  try {
    const { data, error } = await supabase.rpc('create_reminder_notifications');

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Erro ao criar lembretes:', error);
    return { success: false, error };
  }
}
