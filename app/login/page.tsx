'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Loader2, Eye, EyeOff, Pen } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      router.push('/');
    } catch (error: any) {
      setError(error.message || 'Erro ao fazer login. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[var(--accent-primary)]/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo e Título */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-[var(--accent-primary)] flex items-center justify-center shadow-xl hover:shadow-2xl transition-shadow">
            <Pen className="text-white" size={32} />
          </div>
          <h1 className="text-4xl font-bold text-[var(--text-primary)]">
            Poupen
          </h1>
          <p className="text-[var(--text-secondary)] mt-3 text-lg">Controle suas finanças com inteligência</p>
        </div>

        {/* Card de Login */}
        <div className="bg-[var(--bg-secondary)] backdrop-blur-2xl rounded-2xl p-8 border border-[var(--border-primary)] shadow-2xl hover:border-[var(--border-secondary)] transition-all">
          {/* Erro */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg backdrop-blur-sm">
              <p className="text-sm text-red-400 font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <Input
              type="email"
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              disabled={loading}
              variant="default"
            />

            {/* Senha */}
            <div className="space-y-2">
              <label className="block text-sm md:text-base font-semibold text-[var(--text-primary)]">
                Senha
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 md:py-3 text-sm md:text-base font-medium transition-all duration-200 bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent-primary)] focus:ring-2 focus:ring-[var(--accent-primary)]/20 hover:border-[var(--border-secondary)] rounded-lg"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Botão de Login */}
            <Button
              type="submit"
              disabled={loading}
              variant="primary"
              className="w-full mt-8 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </Button>
          </form>

          {/* Link para Signup */}
          <p className="text-center text-[var(--text-secondary)] mt-8">
            Não tem conta?{' '}
            <Link href="/signup" className="text-[var(--accent-primary)] font-semibold hover:opacity-80 transition-opacity">
              Criar nova conta
            </Link>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-[var(--text-tertiary)] mt-8">
          Seus dados são protegidos e nunca compartilhados
        </p>
      </div>
    </div>
  );
}
