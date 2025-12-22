import { supabase } from '@/lib/supabase';
import { Notification, ApiResponse, PaginatedResponse } from '@/lib/types';
import { handleError, createSuccessResponse } from '@/lib/error-handler';
import { PAGINATION } from '@/lib/constants';

export interface GetNotificationsParams {
  userId: string;
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}

export async function getNotifications(
  params: GetNotificationsParams
): Promise<ApiResponse<PaginatedResponse<Notification>>> {
  try {
    const {
      userId,
      page = PAGINATION.DEFAULT_PAGE,
      limit = PAGINATION.DEFAULT_LIMIT,
      unreadOnly = false,
    } = params;

    const finalLimit = Math.min(limit, PAGINATION.MAX_LIMIT);
    const offset = (page - 1) * finalLimit;

    let query = supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (unreadOnly) {
      query = query.eq('read', false);
    }

    query = query.range(offset, offset + finalLimit - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    const total = count || 0;
    const pages = Math.ceil(total / finalLimit);

    return createSuccessResponse<PaginatedResponse<Notification>>({
      data: (data as Notification[]) || [],
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

export async function markNotificationAsRead(
  userId: string,
  notificationId: string
): Promise<ApiResponse<Notification>> {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .update({
        read: true,
        read_at: new Date().toISOString(),
      })
      .eq('id', notificationId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    return createSuccessResponse<Notification>(data);
  } catch (error) {
    const { message } = handleError(error);
    return { success: false, error: message };
  }
}

export async function createNotification(
  userId: string,
  notification: Omit<Notification, 'id' | 'user_id' | 'created_at' | 'read_at'>
): Promise<ApiResponse<Notification>> {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        ...notification,
        read: false,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return createSuccessResponse<Notification>(data);
  } catch (error) {
    const { message } = handleError(error);
    return { success: false, error: message };
  }
}

export async function getUnreadNotificationCount(userId: string): Promise<ApiResponse<number>> {
  try {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) throw error;

    return createSuccessResponse<number>(count || 0);
  } catch (error) {
    const { message } = handleError(error);
    return { success: false, error: message, data: 0 };
  }
}
