'use client';

import { useState, useEffect } from 'react';
import { Plus, X, Loader2, Trash2 } from 'lucide-react';
import { fetchTransactions, createTransaction, deleteTransaction, createRecurringTransaction } from '@/lib/supabase-queries';
import { useAuth } from '@/lib/auth-context';
import { formatNumber } from '@/lib/format';
import { useValueVisibility } from '@/lib/ValueVisibilityContext';
import { MaskedValue } from '@/components/MaskedValue';
import CategoryInput from '@/components/CategoryInput';

export default function EntradasPage() {
  const { user, loading: authLoading } = useAuth();
  const { isValuesVisible } = useValueVisibility();
  const [entradas, setEntradas] = useState<any[]>([]);
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

  // Carregar entradas ao montar
  useEffect(() => {
    if (!authLoading && user) {
      loadEntradas();
    }
  }, [user, authLoading]);

  const loadEntradas = async () => {
    setLoading(true);
    try {
      const data = await fetchTransactions(user!.id, 'income');
      setEntradas(data);
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
        type: 'income',
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
          type: 'income',
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
        await loadEntradas();
      }
    } catch (error) {
      console.error('Erro ao criar entrada:', error);
      alert('Erro ao criar entrada');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja deletar esta entrada?')) return;

    setDeleting(id);
    try {
      const result = await deleteTransaction(id);
      if (result.success) {
        setEntradas(entradas.filter(e => e.id !== id));
      }
    } catch (error) {
      console.error('Erro ao deletar:', error);
      alert('Erro ao deletar entrada');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)]">
            Entradas
          </h1>
          <p className="text-[var(--text-secondary)] mt-1 text-sm md:text-base">
            Gerencie suas receitas
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 bg-[var(--accent-primary)] hover:opacity-90 text-white px-5 py-2.5 rounded-lg transition-opacity font-medium text-sm md:text-base w-full md:w-auto"
        >
          <Plus className="w-4 h-4 md:w-5 md:h-5" />
          Nova Entrada
        </button>
      </div>

      {/* Lista de Entradas */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-[var(--text-secondary)]" />
          </div>
        ) : entradas.length > 0 ? (
          <div>
            {entradas.map((entrada, index) => (
              <div 
                key={entrada.id}
                className={`flex items-center justify-between p-4 md:p-5 ${
                  index !== entradas.length - 1 ? 'border-b border-[var(--border-primary)]' : ''
                } hover:bg-[var(--bg-hover)] transition-colors group`}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[var(--text-primary)] truncate">{entrada.description}</p>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <p className="text-xs md:text-sm text-[var(--text-secondary)]">{entrada.category}</p>
                    <p className="text-xs text-[var(--text-tertiary)]">
                      {new Date(entrada.date).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                  <div className="text-sm md:text-base font-bold text-[var(--status-success)]">
                    <MaskedValue
                      value={`+R$ ${formatNumber(parseFloat(entrada.amount))}`}
                      isVisible={isValuesVisible}
                      onToggle={() => {}}
                    />
                  </div>
                  <button
                    onClick={() => handleDelete(entrada.id)}
                    disabled={deleting === entrada.id}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-[var(--status-error)] hover:bg-[var(--status-error)]/10 rounded-lg disabled:opacity-50"
                  >
                    {deleting === entrada.id ? (
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
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <p className="text-[var(--text-secondary)] text-sm">Nenhuma entrada registrada ainda</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--bg-primary)] rounded-lg w-full max-w-md p-6 shadow-lg border border-[var(--border-primary)] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[var(--text-primary)]">
                Nova Entrada
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Valor
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--border-primary)] rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent-primary)]"
                  placeholder="0.00"
                />
              </div>

              {user ? (
                <CategoryInput
                  value={formData.category}
                  onChange={(value) => setFormData({ ...formData, category: value })}
                  userId={user.id}
                  type="income"
                  required
                />
              ) : (
                <div className="text-sm text-[var(--text-secondary)]">Carregando categorias...</div>
              )}

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Descrição
                </label>
                <input
                  type="text"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--border-primary)] rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent-primary)]"
                  placeholder="Ex: Salário"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Data
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--border-primary)] rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isRecurring}
                    onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm font-medium text-[var(--text-primary)]">
                    Tornar recorrente
                  </span>
                </label>
              </div>

              {formData.isRecurring && (
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    Frequência
                  </label>
                  <select
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                    className="w-full px-3 py-2 border border-[var(--border-primary)] rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
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

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors font-medium text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[var(--accent-primary)] text-white rounded-lg hover:opacity-90 transition-opacity font-medium text-sm"
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
