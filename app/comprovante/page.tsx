'use client';

import { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Loader2, CheckCircle, X } from 'lucide-react';
import { createTransaction } from '@/lib/supabase-queries';
import { useAuth } from '@/lib/auth-context';
import { gradients } from '@/lib/colorMap';
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
      const response = await fetch('http://localhost:3001/api/process-receipt', {
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
        <h1 
          className="text-5xl font-bold text-transparent bg-clip-text"
          style={{ backgroundImage: gradients.slate }}
        >
          Comprovante
        </h1>
        <p className="text-slate-400 mt-3 text-lg">
          Escanear e identificar automaticamente valor e categoria
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload de Imagem */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 border border-slate-700/30 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-6">
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
                className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-4 rounded-xl shadow-lg transition-all duration-300 font-semibold"
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
                className="w-full flex items-center justify-center gap-3 bg-slate-700 hover:bg-slate-600 text-white px-6 py-4 rounded-xl shadow-lg transition-all duration-300 font-semibold"
              >
                <Upload className="w-5 h-5" />
                Escolher da Galeria
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative aspect-video bg-slate-900 rounded-xl overflow-hidden border border-slate-600">
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
                  className="flex-1 px-4 py-2 border border-slate-600 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors font-semibold"
                >
                  Cancelar
                </button>
                <button
                  onClick={processReceipt}
                  disabled={processing}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white rounded-lg transition-colors font-semibold"
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
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 border border-slate-700/30 shadow-2xl">
            <div className="mb-6">
              {result.amount ? (
                <div className="flex items-center gap-2 text-green-400 bg-green-900/20 p-3 rounded-lg mb-4">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Comprovante processado com sucesso!</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-amber-400 bg-amber-900/20 p-3 rounded-lg mb-4">
                  <Loader2 className="w-5 h-5" />
                  <span className="font-medium">Insira os dados manualmente</span>
                </div>
              )}
            </div>

            <h2 className="text-2xl font-bold text-white mb-6">
              Criar Despesa
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Valor * {result.amount && `(Detectado: R$ ${result.amount})`}
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-600 rounded-lg bg-slate-900 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

              {user ? (
                <CategoryInput
                  value={formData.category}
                  onChange={(value) => setFormData({ ...formData, category: value })}
                  userId={user.id}
                  type="expense"
                  variant="dark"
                  required
                />
              ) : (
                <div className="text-sm text-slate-400">Carregando categorias...</div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Descrição *
                </label>
                <input
                  type="text"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-600 rounded-lg bg-slate-900 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Descrição da despesa"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Data
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-600 rounded-lg bg-slate-900 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white px-6 py-3 rounded-xl shadow-lg transition-all duration-300 font-semibold flex items-center justify-center gap-2"
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

      {/* Instruções */}
      <div className="bg-blue-900/20 rounded-2xl p-8 border border-blue-700/30 shadow-lg">
        <h3 className="text-xl font-bold text-blue-200 mb-4">
          💡 Como usar
        </h3>
        <ol className="space-y-3 text-blue-100">
          <li>1. <strong>Capture ou selecione</strong> uma foto do comprovante/nota</li>
          <li>2. <strong>Clique em "Processar"</strong> para extrair valor e categoria</li>
          <li>3. <strong>Revise e edite</strong> os dados no formulário ao lado</li>
          <li>4. <strong>Selecione a categoria</strong> correta manualmente se necessário</li>
          <li>5. <strong>Clique em "Salvar Despesa"</strong> para finalizar</li>
        </ol>
      </div>

      {/* Dicas */}
      <div className="bg-amber-900/20 rounded-2xl p-8 border border-amber-700/30 shadow-lg">
        <h3 className="text-xl font-bold text-amber-200 mb-4">
          🔍 Dicas para melhor resultado
        </h3>
        <ul className="space-y-2 text-amber-100">
          <li>✓ Comprovante bem iluminado e em foco</li>
          <li>✓ Sem reflexos ou sombras na imagem</li>
          <li>✓ Câmera estável durante a captura</li>
          <li>✓ Comprovante completamente visível na foto</li>
        </ul>
      </div>
    </div>
  );
}
