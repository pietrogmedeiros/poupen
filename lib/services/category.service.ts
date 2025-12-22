import { supabase } from '@/lib/supabase';
import { Category, ApiResponse } from '@/lib/types';
import { handleError, createSuccessResponse } from '@/lib/error-handler';

export async function getCategories(userId: string): Promise<ApiResponse<Category[]>> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('name', { ascending: true });

    if (error) throw error;

    return createSuccessResponse<Category[]>(data || []);
  } catch (error) {
    const { message } = handleError(error);
    return { success: false, error: message, data: [] };
  }
}

export async function createCategory(
  userId: string,
  category: Omit<Category, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'deleted_at'>
): Promise<ApiResponse<Category>> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .insert({
        user_id: userId,
        ...category,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return createSuccessResponse<Category>(data);
  } catch (error) {
    const { message } = handleError(error);
    return { success: false, error: message };
  }
}

export async function updateCategory(
  userId: string,
  categoryId: string,
  updates: Partial<Omit<Category, 'id' | 'user_id' | 'created_at' | 'deleted_at'>>
): Promise<ApiResponse<Category>> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', categoryId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    return createSuccessResponse<Category>(data);
  } catch (error) {
    const { message } = handleError(error);
    return { success: false, error: message };
  }
}

export async function deleteCategory(
  userId: string,
  categoryId: string
): Promise<ApiResponse<void>> {
  try {
    const { error } = await supabase
      .from('categories')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', categoryId)
      .eq('user_id', userId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    const { message } = handleError(error);
    return { success: false, error: message };
  }
}
