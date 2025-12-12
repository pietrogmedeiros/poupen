'use client';

import { useState, useEffect } from 'react';
import { Plus, X, Loader2, Trash2 } from 'lucide-react';
import { fetchTransactions, createTransaction, deleteTransaction, createRecurringTransaction } from '@/lib/supabase-queries';
import { useAuth } from '@/lib/auth-context';
import { formatNumber } from '@/lib/format';
import { useValueVisibility } from '@/lib/ValueVisibilityContext';
import { MaskedValue } from '@/components/MaskedValue';
import { gradients } from '@/lib/colorMap';
import CategoryInput from '@/components/CategoryInput';

export default function DespesasPage() {
  const { user, loading: authLoading } = useAuth();
  const { isValuesVisible } = useValueVisibility();
  const [despesas, setDespesas] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    isRecurring: false,
    frequency: 'monthly',
  });

  // Carregar despesas ao montar
  useEffect(() => {
    if (!authLoading && user) {
      loadDespesas();
    }
  }, [user, authLoading]);

  const loadDespesas = async () => {
    setLoading(true);
    try {
      const data = await fetchTransactions(user!.id, 'expense');
      setDespesas(data);
    } catch (error) {
      console.error('Erro ao carregar:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.category || !formData.description) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    try {
      // Criar transação normal
      const result = await createTransaction(user!.id, {
        type: 'expense',
        amount: parseFloat(formData.amount),
        category: formData.category,
        description: formData.description,
        date: formData.date,
      });

      // Se for recorrente, criar também na tabela de recorrências
      if (formData.isRecurring) {
        await createRecurringTransaction(user!.id, {
          description: formData.description,
          amount: parseFloat(formData.amount),
          category: formData.category,
          type: 'expense',
          frequency: formData.frequency as any,
          start_date: formData.date,
        });
      }

      if (result.success) {
        setShowModal(false);
        setFormData({
          amount: '',
          category: '',
          description: '',
          date: new Date().toISOString().split('T')[0],
          isRecurring: false,
          frequency: 'monthly',
        });
        await loadDespesas();
      }
    } catch (error) {
      console.error('Erro ao criar despesa:', error);
      alert('Erro ao criar despesa');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja deletar esta despesa?')) return;

    setDeleting(id);
    try {
      const result = await deleteTransaction(id);
      if (result.success) {
        setDespesas(despesas.filter(d => d.id !== id));
      }
    } catch (error) {
      console.error('Erro ao deletar:', error);
      alert('Erro ao deletar despesa');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 
            className="text-5xl font-bold text-transparent bg-clip-text"
            style={{ backgroundImage: gradients.slate }}
          >
            Despesas
          </h1>
          <p className="text-slate-400 mt-3 text-lg">
            Controle seus gastos mensais
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center md:justify-start gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold w-full md:w-auto"
        >
          <Plus className="w-5 h-5" />
          Nova Despesa
        </button>
      </div>

      {/* Lista de Despesas */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-slate-700/30 p-8 shadow-2xl hover:border-slate-700/50 transition-all">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        ) : despesas.length > 0 ? (
          <div className="space-y-3">
            {despesas.map((despesa) => (
              <div key={despesa.id} className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl hover:bg-slate-800/60 transition-all border border-slate-700/30 hover:border-slate-700/60 group">
                <div className="flex-1">
                  <p className="font-semibold text-white group-hover:text-red-100 transition-colors">{despesa.description}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-sm text-slate-400">{despesa.category}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(despesa.date).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-lg font-bold text-red-400 flex items-center gap-2">
                    <MaskedValue
                      value={`-R$ ${formatNumber(parseFloat(despesa.amount))}`}
                      isVisible={isValuesVisible}
                      onToggle={() => {}}
                    />
                  </div>
                  <button
                    onClick={() => handleDelete(despesa.id)}
                    disabled={deleting === despesa.id}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-red-400 hover:bg-red-500/10 rounded-lg disabled:opacity-50"
                  >
                    {deleting === despesa.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-slate-500">
            <svg className="w-16 h-16 opacity-50 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m0 0h6m-6-6H6m0 0H0" />
            </svg>
            <p className="text-slate-400">Nenhuma despesa registrada ainda</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-6 md:p-8 shadow-2xl border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Nova Despesa
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Valor
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

              {user ? (
                <CategoryInput
                  value={formData.category}
                  onChange={(value) => setFormData({ ...formData, category: value })}
                  userId={user.id}
                  type="expense"
                  required
                />
              ) : (
                <div className="text-sm text-gray-500 dark:text-gray-400">Carregando categorias...</div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Descrição
                </label>
                <input
                  type="text"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  placeholder="Ex: Conta de luz"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Data
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                />
              </div>

              <div className="col-span-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isRecurring}
                    onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 dark:border-gray-600"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Tornar recorrente
                  </span>
                </label>
              </div>

              {formData.isRecurring && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Frequência
                  </label>
                  <select
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-500"
                  >
                    <option value="daily">Diariamente</option>
                    <option value="weekly">Semanalmente</option>
                    <option value="biweekly">Quinzenalmente</option>
                    <option value="monthly">Mensalmente</option>
                    <option value="quarterly">Trimestralmente</option>
                    <option value="yearly">Anualmente</option>
                  </select>
                </div>
              )}

              <div className="flex gap-3 pt-4 col-span-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-lg transition-colors font-medium"
                >
                  Adicionar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
