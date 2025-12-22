// User types
export interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserProfile extends User {
  preferred_currency?: string;
  language?: string;
  theme?: 'light' | 'dark' | 'auto';
  notifications_enabled?: boolean;
}

// Transaction types
export interface Transaction {
  id: string;
  user_id: string;
  description: string;
  amount: number;
  category: string;
  type: 'entrada' | 'despesa';
  date: string;
  notes?: string;
  receipt_url?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface TransactionFilters {
  startDate?: string;
  endDate?: string;
  category?: string;
  type?: 'entrada' | 'despesa';
  minAmount?: number;
  maxAmount?: number;
}

// Category types
export interface Category {
  id: string;
  user_id: string;
  name: string;
  color: string;
  icon?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

// Budget types
export interface Budget {
  id: string;
  user_id: string;
  category: string;
  limit: number;
  month: string;
  spent?: number;
  created_at: string;
  updated_at: string;
}

// Recurring transaction types
export type RecurrenceFrequency = 'diaria' | 'semanal' | 'mensal' | 'anual';

export interface RecurringTransaction {
  id: string;
  user_id: string;
  description: string;
  amount: number;
  category: string;
  frequency: RecurrenceFrequency;
  startDate: string;
  endDate?: string | null;
  type: 'entrada' | 'despesa';
  notes?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

// Notification types
export type NotificationType = 'info' | 'warning' | 'error' | 'success';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  read_at?: string | null;
  created_at: string;
}

// Receipt types
export interface Receipt {
  id: string;
  user_id: string;
  file_url: string;
  extracted_text?: string;
  extracted_amount?: number;
  extracted_category?: string;
  created_at: string;
  updated_at: string;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

// Monthly stats types
export interface MonthlyStat {
  month: string;
  income: number;
  expenses: number;
  balance: number;
}

export interface CategoryStat {
  category: string;
  amount: number;
  percentage: number;
  count: number;
}

export interface MonthlyStats {
  month: string;
  income: number;
  expenses: number;
  balance: number;
  byCategory: CategoryStat[];
}
