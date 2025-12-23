'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Calendar, DollarSign, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useValueVisibility } from '@/lib/ValueVisibilityContext';
import { MaskedValue } from '@/components/MaskedValue';

import { 
  fetchRecurringTransactions, 
  createRecurringTransaction,
  updateRecurringTransaction,
  deleteRecurringTransaction 
} from '@/lib/supabase-queries';
import { formatNumber } from '@/lib/format';

interface RecurringTransaction {
  id: string;
  description: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  frequency: string;
  next_occurrence: string;
  active: boolean;
}

export default function RecorridosPage() {
  const { user, loading: authLoading } = useAuth();
  const { isValuesVisible } = useValueVisibility();
  const [recorrencias, setRecorrencias] = useState<RecurringTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: 'Geral',
    type: 'expense' as 'income' | 'expense',
    frequency: 'monthly' as 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    day_of_month: new Date().getDate(),
  });

  useEffect(() => {
    if (user) {
      loadRecorrencias();
    }
  }, [user]);

  const loadRecorrencias = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await fetchRecurringTransactions(user.id);
      setRecorrencias(data);
    } catch (error) {
      console.error('Erro ao carregar recorrências:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      if (editingId) {
        await updateRecurringTransaction(editingId, {
          description: formData.description,
          amount: parseFloat(formData.amount),
          category: formData.category,
          frequency: formData.frequency,
          end_date: formData.end_date || undefined,
          day_of_month: parseInt(formData.day_of_month.toString()),
        });
      } else {
        await createRecurringTransaction(user.id, {
          description: formData.description,
          amount: parseFloat(formData.amount),
          category: formData.category,
          type: formData.type,
          frequency: formData.frequency,
          start_date: formData.start_date,
          end_date: formData.end_date || undefined,
          day_of_month: parseInt(formData.day_of_month.toString()),
        });
      }

      setFormData({
        description: '',
        amount: '',
        category: 'Geral',
        type: 'expense',
        frequency: 'monthly',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        day_of_month: new Date().getDate(),
      });
      setEditingId(null);
      setShowForm(false);
      await loadRecorrencias();
    } catch (error) {
      console.error('Erro ao salvar recorrência:', error);
      alert('Erro ao salvar recorrência');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar esta recorrência?')) return;

    try {
      await deleteRecurringTransaction(id);
      await loadRecorrencias();
    } catch (error) {
      console.error('Erro ao deletar recorrência:', error);
      alert('Erro ao deletar recorrência');
    }
  };

  const handleEdit = (recorrencia: RecurringTransaction) => {
    setFormData({
      description: recorrencia.description,
      amount: recorrencia.amount.toString(),
      category: recorrencia.category || 'Geral',
      type: recorrencia.type,
      frequency: recorrencia.frequency as any,
      start_date: new Date().toISOString().split('T')[0],
      end_date: '',
      day_of_month: new Date().getDate(),
    });
    setEditingId(recorrencia.id);
    setShowForm(true);
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--text-secondary)]" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-[var(--text-secondary)]">Faça login para continuar</p>
      </div>
    );
  }

  const frequencyLabels: Record<string, string> = {
    daily: 'Diariamente',
    weekly: 'Semanalmente',
    biweekly: 'Quinzenalmente',
    monthly: 'Mensalmente',
    quarterly: 'Trimestralmente',
    yearly: 'Anualmente',
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent">
            Recorridos
          </h1>
          <p className="text-[var(--text-secondary)] mt-1 text-sm md:text-base">
            Gerencie suas despesas e receitas recorrentes
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            if (showForm) {
              setFormData({
                description: '',
                amount: '',
                category: 'Geral',
                type: 'expense',
                frequency: 'monthly',
                start_date: new Date().toISOString().split('T')[0],
                end_date: '',
                day_of_month: new Date().getDate(),
              });
            }
          }}
          className="flex items-center justify-center gap-2 bg-[var(--accent-primary)] hover:opacity-90 text-white px-5 py-2.5 rounded-lg transition-opacity font-medium text-sm md:text-base w-full md:w-auto"
        >
          <Plus className="w-4 h-4 md:w-5 md:h-5" />
          Nova Recorrência
        </button>
      </div>

      {/* Formulário */}
      {showForm && (
        <div className="bg-[var(--bg-secondary)] border border-amber-500/30 rounded-lg p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {editingId ? 'Editar Recorrência' : 'Nova Recorrência'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Descrição *
                </label>
                <input
                  type="text"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Aluguel, Internet..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Valor *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tipo *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="expense">Despesa</option>
                  <option value="income">Receita</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Categoria
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Alimentação..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Frequência *
                </label>
                <select
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="daily">Diariamente</option>
                  <option value="weekly">Semanalmente</option>
                  <option value="biweekly">Quinzenalmente</option>
                  <option value="monthly">Mensalmente</option>
                  <option value="quarterly">Trimestralmente</option>
                  <option value="yearly">Anualmente</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Dia do Mês
                </label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={formData.day_of_month || ''}
                  onChange={(e) => setFormData({ ...formData, day_of_month: e.target.value ? parseInt(e.target.value) : 1 })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Data de Início *
                </label>
                <input
                  type="date"
                  required
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Data de Término (opcional)
                </label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                {editingId ? 'Atualizar' : 'Criar'} Recorrência
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
                className="flex-1 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-700 text-gray-900 dark:text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de Recorrências */}
      <div className="bg-[var(--bg-secondary)] border border-amber-500/30 rounded-lg p-6 shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-600 dark:text-gray-400" />
          </div>
        ) : recorrencias.length === 0 ? (
          <p className="text-center text-gray-600 dark:text-gray-400 py-12">
            Nenhuma transação recorrente cadastrada
          </p>
        ) : (
          <div className="space-y-3">
            {recorrencias.map((recorrencia) => (
              <div
                key={recorrencia.id}
                className="flex items-center justify-between p-4 rounded-xl transition-colors border"
                style={{background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)'}}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{
                    background: recorrencia.type === 'income' 
                      ? 'rgba(34, 197, 94, 0.15)' 
                      : 'rgba(239, 68, 68, 0.15)'
                  }}>
                    <DollarSign className={`w-5 h-5 ${
                      recorrencia.type === 'income'
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {recorrencia.description}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {recorrencia.category} • {frequencyLabels[recorrencia.frequency]}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-right">
                  <div>
                    <div className={`font-semibold flex items-center justify-end gap-2 ${
                      recorrencia.type === 'income'
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      <MaskedValue
                        value={`${recorrencia.type === 'income' ? '+' : '-'} R$ ${formatNumber(recorrencia.amount)}`}
                        isVisible={isValuesVisible}
                        onToggle={() => {}}
                      />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      <Calendar className="w-3 h-3 inline mr-1" />
                      {new Date(recorrencia.next_occurrence).toLocaleDateString('pt-BR')}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(recorrencia)}
                      className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </button>
                    <button
                      onClick={() => handleDelete(recorrencia.id)}
                      className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                      title="Deletar"
                    >
                      <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
