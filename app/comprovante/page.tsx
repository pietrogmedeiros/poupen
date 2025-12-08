'use client';

import { useState, useRef } from 'react';
import { Camera, Upload, Loader2, CheckCircle, X } from 'lucide-react';
import { uploadReceipt } from '@/lib/supabase-queries';
import { useAuth } from '@/lib/auth-context';

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
        setResult(data.data);
      }
    } catch (error) {
      console.error('Erro ao processar comprovante:', error);
      alert('Erro ao processar comprovante. Certifique-se de que o servidor está rodando.');
    } finally {
      setProcessing(false);
    }
  };

  const saveTransaction = async () => {
    if (!result || !selectedFile) return;
    
    setSaving(true);
    try {
      const amount = result.amount ? parseFloat(result.amount) : 0;
      
      // Fazer upload do comprovante e criar transação
      await uploadReceipt(user!.id, selectedFile, amount, result.category);
      
      alert('Transação salva com sucesso!');
      
      setSelectedImage(null);
      setSelectedFile(null);
      setResult(null);
    } catch (error) {
      console.error('Erro ao salvar transação:', error);
      alert('Erro ao salvar transação. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          Escanear Comprovante
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Use a câmera ou galeria para identificar automaticamente valor e categoria
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload de Imagem */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Selecionar Imagem
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
                className="w-full flex items-center justify-center gap-3 bg-gray-700 hover:bg-gray-800 text-white px-6 py-4 rounded-xl shadow-lg transition-all duration-300 font-medium"
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
                className="w-full flex items-center justify-center gap-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white px-6 py-4 rounded-xl shadow-md transition-all duration-300 font-medium hover:shadow-lg"
              >
                <Upload className="w-5 h-5" />
                Escolher da Galeria
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative aspect-video bg-gray-200 dark:bg-gray-700 rounded-xl overflow-hidden border border-gray-300 dark:border-gray-600">
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
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={processReceipt}
                  disabled={processing}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-800 disabled:bg-gray-400 text-white rounded-lg transition-colors font-medium"
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

        {/* Resultado do Processamento */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Resultado
          </h2>

          {!result ? (
            <div className="flex items-center justify-center h-80 text-gray-400 dark:text-gray-500">
              <div className="text-center">
                <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-gray-600 dark:text-gray-400">Nenhum comprovante processado ainda</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Comprovante processado com sucesso!</span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Valor Detectado
                  </label>
                  <input
                    type="text"
                    value={result.amount || 'Não detectado'}
                    readOnly
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Categoria Sugerida
                  </label>
                  <input
                    type="text"
                    value={result.category}
                    readOnly
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white capitalize"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Texto Extraído
                  </label>
                  <textarea
                    value={result.text}
                    readOnly
                    rows={5}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  />
                </div>

                <button
                  onClick={saveTransaction}
                  disabled={saving}
                  className="w-full bg-gray-700 hover:bg-gray-800 disabled:bg-gray-400 text-white px-6 py-3 rounded-xl shadow-lg transition-all duration-300 font-medium flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Salvar Transação
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Instruções */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
        <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-3">
          💡 Dicas para melhor resultado
        </h3>
        <ul className="space-y-2 text-blue-800 dark:text-blue-200">
          <li>• Certifique-se de que o comprovante está bem iluminado</li>
          <li>• Evite reflexos e sombras na imagem</li>
          <li>• Mantenha a câmera estável e focada</li>
          <li>• O comprovante deve estar completamente visível</li>
        </ul>
      </div>
    </div>
  );
}
