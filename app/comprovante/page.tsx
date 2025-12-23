'use client';

import { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Loader2, CheckCircle, X } from 'lucide-react';
import { createTransaction } from '@/lib/supabase-queries';
import { useAuth } from '@/lib/auth-context';

import CategoryInput from '@/components/CategoryInput';

export default function ComprovantePage() {
  const { user, loading: authLoading } = useAuth();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<{
    amount: string | null;
    category: string;
    text: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    amount: '',
    category: 'Geral',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  // Atualizar formulário quando resultado é processado
  useEffect(() => {
    if (result) {
      const detectedAmount = result.amount || '';
      setFormData(prev => ({
        ...prev,
        amount: detectedAmount,
        category: result.category || 'Geral',
        description: result.text.split('\n')[0] || 'Comprovante',
      }));
    }
  }, [result]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const processReceipt = async () => {
    if (!selectedImage) return;

    setProcessing(true);
    try {
      const response = await fetch('/api/process-receipt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: selectedImage }),
      });

      const data = await response.json();
      if (data.success) {
        console.log('Resultado recebido:', data.data);
        setResult(data.data);
      }
    } catch (error) {
      console.error('Erro ao processar comprovante:', error);
      // Fallback: permitir entrada manual
      setResult({
        amount: '',
        category: 'Geral',
        text: 'Processamento automático indisponível. Por favor, insira os dados manualmente abaixo.',
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.category || !formData.description) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    setSaving(true);
    try {
      const result = await createTransaction(user!.id, {
        type: 'expense',
        amount: parseFloat(formData.amount),
        category: formData.category,
        description: formData.description,
        date: formData.date,
      });

      if (result.success) {
        alert('Despesa salva com sucesso!');
        setSelectedImage(null);
        setSelectedFile(null);
        setResult(null);
        setFormData({
          amount: '',
          category: 'Geral',
          description: '',
          date: new Date().toISOString().split('T')[0],
        });
      }
    } catch (error) {
      console.error('Erro ao salvar despesa:', error);
      alert('Erro ao salvar despesa');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)]">
          Comprovante
        </h1>
        <p className="text-[var(--text-secondary)] mt-1 text-sm md:text-base">
          Escanear e identificar automaticamente valor e categoria
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload de Imagem */}
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">
            {selectedImage ? 'Imagem Selecionada' : 'Selecionar Imagem'}
          </h2>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            accept="image/*"
            capture="environment"
            className="hidden"
          />

          {!selectedImage ? (
            <div className="space-y-4">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-3 bg-[var(--accent-primary)] hover:opacity-90 text-white px-6 py-4 rounded-lg transition-opacity font-semibold"
              >
                <Camera className="w-5 h-5" />
                Tirar Foto
              </button>

              <button
                onClick={() => {
                  if (fileInputRef.current) {
                    fileInputRef.current.removeAttribute('capture');
                    fileInputRef.current.click();
                  }
                }}
                className="w-full flex items-center justify-center gap-3 bg-[var(--bg-hover)] hover:bg-[var(--bg-secondary)] text-[var(--text-primary)] px-6 py-4 rounded-lg transition-colors font-semibold border border-[var(--border-primary)]"
              >
                <Upload className="w-5 h-5" />
                Escolher da Galeria
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative aspect-video bg-[var(--bg-hover)] rounded-lg overflow-hidden border border-[var(--border-primary)]">
                <img
                  src={selectedImage}
                  alt="Comprovante"
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setSelectedImage(null);
                    setResult(null);
                  }}
                  className="flex-1 px-4 py-2 border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors font-semibold"
                >
                  Cancelar
                </button>
                <button
                  onClick={processReceipt}
                  disabled={processing}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[var(--accent-primary)] hover:opacity-90 disabled:opacity-50 text-white rounded-lg transition-opacity font-semibold"
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    'Processar'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Formulário de Despesa */}
        {result && (
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg p-6 shadow-sm">
            <div className="mb-6">
              {result.amount ? (
                <div className="flex items-center gap-2 text-[var(--status-success)] bg-[var(--status-success)]/10 p-3 rounded-lg mb-4 border border-[var(--status-success)]/20">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Comprovante processado com sucesso!</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-[var(--status-warning)] bg-[var(--status-warning)]/10 p-3 rounded-lg mb-4 border border-[var(--status-warning)]/20">
                  <Loader2 className="w-5 h-5" />
                  <span className="font-medium">Insira os dados manualmente</span>
                </div>
              )}
            </div>

            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">
              Criar Despesa
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Valor * {result.amount && `(Detectado: R$ ${result.amount})`}
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
                  type="expense"
                  required
                />
              ) : (
                <div className="text-sm text-[var(--text-secondary)]">Carregando categorias...</div>
              )}

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Descrição *
                </label>
                <input
                  type="text"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--border-primary)] rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent-primary)]"
                  placeholder="Descrição da despesa"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Data
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--border-primary)] rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full bg-[var(--accent-primary)] hover:opacity-90 disabled:opacity-50 text-white px-6 py-3 rounded-lg transition-opacity font-semibold flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Salvar Despesa
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>

    </div>
  );
}
