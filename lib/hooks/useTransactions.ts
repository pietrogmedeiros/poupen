import { useCallback, useState } from 'react';
import { useAuth } from './auth-context';
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getMonthlyStats,
  GetTransactionsParams,
} from './services/transaction.service';
import { Transaction, ApiResponse, PaginatedResponse } from './types';

interface UseTransactionsResult {
  transactions: Transaction[];
  total: number;
  page: number;
  pages: number;
  loading: boolean;
  error: string | null;
  fetch: (params: Omit<GetTransactionsParams, 'userId'>) => Promise<void>;
  create: (transaction: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'deleted_at'>) => Promise<void>;
  update: (id: string, updates: Partial<Transaction>) => Promise<void>;
  delete: (id: string) => Promise<void>;
}

export function useTransactions(): UseTransactionsResult {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(
    async (params: Omit<GetTransactionsParams, 'userId'>) => {
      if (!user) return;

      setLoading(true);
      setError(null);

      try {
        const response = await getTransactions({
          ...params,
          userId: user.id,
        });

        if (response.success && response.data) {
          setTransactions(response.data.data);
          setTotal(response.data.total);
          setPage(response.data.page);
          setPages(response.data.pages);
        } else {
          setError(response.error || 'Erro ao buscar transações');
        }
      } catch (err) {
        setError('Erro ao buscar transações');
        console.error('Error fetching transactions:', err);
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  const create = useCallback(
    async (transaction: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'deleted_at'>) => {
      if (!user) return;

      try {
        const response = await createTransaction(user.id, transaction);

        if (response.success && response.data) {
          setTransactions((prev) => [response.data!, ...prev]);
          setTotal((prev) => prev + 1);
        } else {
          setError(response.error || 'Erro ao criar transação');
        }
      } catch (err) {
        setError('Erro ao criar transação');
        console.error('Error creating transaction:', err);
      }
    },
    [user]
  );

  const update = useCallback(
    async (id: string, updates: Partial<Transaction>) => {
      if (!user) return;

      try {
        const response = await updateTransaction(user.id, id, updates);

        if (response.success && response.data) {
          setTransactions((prev) =>
            prev.map((t) => (t.id === id ? response.data! : t))
          );
        } else {
          setError(response.error || 'Erro ao atualizar transação');
        }
      } catch (err) {
        setError('Erro ao atualizar transação');
        console.error('Error updating transaction:', err);
      }
    },
    [user]
  );

  const deleteTransaction = useCallback(
    async (id: string) => {
      if (!user) return;

      try {
        const response = await deleteTransaction(user.id, id);

        if (response.success) {
          setTransactions((prev) => prev.filter((t) => t.id !== id));
          setTotal((prev) => prev - 1);
        } else {
          setError(response.error || 'Erro ao deletar transação');
        }
      } catch (err) {
        setError('Erro ao deletar transação');
        console.error('Error deleting transaction:', err);
      }
    },
    [user]
  );

  return {
    transactions,
    total,
    page,
    pages,
    loading,
    error,
    fetch,
    create,
    update,
    delete: deleteTransaction,
  };
}
