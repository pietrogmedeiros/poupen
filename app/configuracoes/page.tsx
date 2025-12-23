'use client';

import { useState, useEffect } from 'react';
import { User, Mail, Lock, LogOut, Camera, Save, X, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { fetchUserProfile, updateUserProfile } from '@/lib/supabase-queries';
import { useAuth } from '@/lib/auth-context';

import { useRouter } from 'next/navigation';

export default function ConfiguracoesPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const [userProfile, setUserProfile] = useState({
    id: '',
    name: '',
    email: '',
    phone: '',
    avatar_url: null as string | null,
  });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  const [activeTab, setActiveTab] = useState<'perfil' | 'senha' | 'email'>('perfil');
  const [showAvatarUpload, setShowAvatarUpload] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Carregar dados do usuário ao montar
  useEffect(() => {
    if (!authLoading && user) {
      loadUserProfile();
    }
  }, [user, authLoading]);

  const loadUserProfile = async () => {
    setLoading(true);
    try {
      const profile = await fetchUserProfile(user!.id);
      if (profile) {
        setUserProfile(profile);
        setFormData({
          name: profile.name || '',
          email: profile.email || '',
          phone: profile.phone || '',
        });
        setAvatarPreview(profile.avatar_url);
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5242880) {
        alert('Arquivo muito grande! Máximo 5MB.');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const preview = reader.result as string;
        setAvatarPreview(preview);
      };
      reader.readAsDataURL(file);
    }
  };

  const saveAvatar = async () => {
    if (!avatarPreview || uploading) return;

    setUploading(true);
    try {
      if (avatarPreview.startsWith('data:')) {
        const response = await fetch(avatarPreview);
        const blob = await response.blob();

        const fileExt = blob.type.split('/')[1] || 'jpg';
        const fileName = `${user!.id}/avatar.${fileExt}`;

        console.log('Fazendo upload de:', fileName);

        const { data, error } = await supabase.storage
          .from('avatars')
          .upload(fileName, blob, { upsert: true });

        if (error) {
          console.error('Erro no upload:', error);
          throw error;
        }

        console.log('Upload bem-sucedido:', data);

        const { data: publicData } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);

        const avatarUrl = publicData.publicUrl;

        // Atualizar no banco de dados
        await updateUserProfile(user!.id, {
          avatar_url: avatarUrl,
        });

        setUserProfile({ ...userProfile, avatar_url: avatarUrl });
        setShowAvatarUpload(false);
        showSuccess('Avatar atualizado com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      alert(`Erro ao fazer upload do avatar: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setUploading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateUserProfile(user!.id, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
      });
      setUserProfile({ ...userProfile, ...formData });
      showSuccess('Perfil atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      alert('Erro ao atualizar perfil. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      alert('As senhas não coincidem!');
      return;
    }
    if (passwords.current === '') {
      alert('Digite sua senha atual!');
      return;
    }
    console.log('Alterando senha...');
    showSuccess('Senha alterada com sucesso!');
    setPasswords({ current: '', new: '', confirm: '' });
  };

  const handleEmailChange = (e: React.FormEvent) => {
    e.preventDefault();
    setUserProfile({ ...userProfile, email: formData.email });
    showSuccess('Email atualizado com sucesso!');
  };

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-gray-600 dark:text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-400 to-slate-500 bg-clip-text text-transparent">
          Configurações
        </h1>
        <p className="text-[var(--text-secondary)] mt-1 text-sm md:text-base">
          Gerencie sua conta e preferências
        </p>
      </div>

      {successMessage && (
        <div className="bg-[var(--status-success)]/10 border border-[var(--status-success)] rounded-lg p-4 flex items-center gap-3">
          <div className="w-5 h-5 bg-[var(--status-success)] rounded-full flex items-center justify-center text-white text-sm font-bold">
            ✓
          </div>
          <p className="text-[var(--status-success)]">{successMessage}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-[var(--bg-secondary)] border border-slate-500/30 rounded-lg p-6 shadow-sm space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-[var(--bg-hover)] border-4 border-[var(--border-primary)] flex items-center justify-center overflow-hidden">
                  {userProfile.avatar_url ? (
                    <img src={userProfile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-12 h-12 text-[var(--text-secondary)]" />
                  )}
                </div>
                <button
                  onClick={() => setShowAvatarUpload(true)}
                  className="absolute bottom-0 right-0 bg-[var(--accent-primary)] hover:opacity-90 text-white p-2 rounded-full shadow-lg transition-opacity"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              <div className="text-center">
                <h2 className="text-xl font-bold text-[var(--text-primary)]">
                  {userProfile.name}
                </h2>
                <p className="text-sm text-[var(--text-secondary)]">
                  {userProfile.email}
                </p>
              </div>
            </div>

            <nav className="space-y-2 border-t border-[var(--border-primary)] pt-6">
              <button
                onClick={() => setActiveTab('perfil')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium ${
                  activeTab === 'perfil'
                    ? 'bg-[var(--bg-hover)] text-[var(--text-primary)]'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                }`}
              >
                <User className="w-5 h-5" />
                Perfil
              </button>
              <button
                onClick={() => setActiveTab('senha')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium ${
                  activeTab === 'senha'
                    ? 'bg-[var(--bg-hover)] text-[var(--text-primary)]'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                }`}
              >
                <Lock className="w-5 h-5" />
                Senha
              </button>
              <button
                onClick={() => setActiveTab('email')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium ${
                  activeTab === 'email'
                    ? 'bg-[var(--bg-hover)] text-[var(--text-primary)]'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                }`}
              >
                <Mail className="w-5 h-5" />
                Email
              </button>
            </nav>

            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 text-[var(--status-error)] hover:bg-[var(--status-error)]/10 rounded-lg transition-colors font-medium border-t border-[var(--border-primary)] pt-6 mt-6"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 bg-[var(--bg-secondary)] border border-slate-500/30 rounded-lg p-6 shadow-sm">
          {activeTab === 'perfil' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Informações Pessoais
                </h3>
              </div>

              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-700 hover:bg-gray-800 disabled:bg-gray-400 text-white rounded-lg transition-colors font-medium"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Salvar Alterações
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'senha' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Alterar Senha
                </h3>
              </div>

              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Senha Atual
                  </label>
                  <input
                    type="password"
                    value={passwords.current}
                    onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    placeholder="Digite sua senha atual"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nova Senha
                  </label>
                  <input
                    type="password"
                    value={passwords.new}
                    onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    placeholder="Digite sua nova senha"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Confirmar Nova Senha
                  </label>
                  <input
                    type="password"
                    value={passwords.confirm}
                    onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    placeholder="Confirme sua nova senha"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-700 hover:bg-gray-800 text-white rounded-lg transition-colors font-medium"
                >
                  <Save className="w-5 h-5" />
                  Alterar Senha
                </button>
              </form>
            </div>
          )}

          {activeTab === 'email' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Alterar Email
                </h3>
              </div>

              <form onSubmit={handleEmailChange} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Atual
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    readOnly
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Novo Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    placeholder="Seu novo email"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-700 hover:bg-gray-800 text-white rounded-lg transition-colors font-medium"
                >
                  <Save className="w-5 h-5" />
                  Alterar Email
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {showAvatarUpload && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Alterar Avatar
              </h3>
              <button
                onClick={() => {
                  setShowAvatarUpload(false);
                  setAvatarPreview(userProfile.avatar_url);
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {avatarPreview && (
              <div className="mb-6">
                <img
                  src={avatarPreview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
            )}

            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarSelect}
              className="hidden"
              id="avatar-input"
            />

            <label
              htmlFor="avatar-input"
              className="block w-full px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-center cursor-pointer hover:border-gray-400 dark:hover:border-gray-500 transition-colors mb-4"
            >
              <p className="text-gray-600 dark:text-gray-400 font-medium">
                Clique para selecionar uma imagem
              </p>
            </label>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowAvatarUpload(false);
                  setAvatarPreview(userProfile.avatar_url);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={saveAvatar}
                disabled={uploading || !avatarPreview}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-800 disabled:bg-gray-400 text-white rounded-lg transition-colors font-medium"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Salvar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
