'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from './supabase';
import * as bcrypt from 'bcryptjs';
import { User } from './types';
import { STORAGE_KEYS, BCRYPT_CONFIG, ERROR_MESSAGES } from './constants';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSession();
  }, []);

  async function checkSession() {
    try {
      const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
      if (storedUser) {
        const userData = JSON.parse(storedUser) as User;
        // Verificar se o usuário ainda existe no banco
        const { data } = await supabase
          .from('users')
          .select('*')
          .eq('id', userData.id)
          .single();

        if (data) {
          setUser(data as User);
        } else {
          localStorage.removeItem(STORAGE_KEYS.USER);
        }
      }
    } catch (error) {
      console.error('Erro ao verificar sessão:', error);
      localStorage.removeItem(STORAGE_KEYS.USER);
    } finally {
      setLoading(false);
    }
  }

  async function signUp(email: string, password: string, name: string) {
    try {
      // Gerar um UUID simples
      const userId = crypto.randomUUID();

      // Hash da senha com bcrypt
      const hashedPassword = await bcrypt.hash(password, BCRYPT_CONFIG.ROUNDS);

      // Inserir na tabela users COM a senha hasheada
      // @ts-ignore - Supabase typing issue
      const { data, error } = await (supabase.from('users').insert([
        {
          id: userId,
          email: email.toLowerCase().trim(),
          name,
          password_hash: hashedPassword,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]) as any);

      if (error) throw error;

      const newUser: User = {
        id: userId,
        email,
        name,
      };

      setUser(newUser);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
    } catch (error) {
      console.error('Erro ao fazer signup:', error);
      throw error;
    }
  }

  async function signIn(email: string, password: string) {
    try {
      // Buscar usuário pelo email (normalizado)
      const normalizedEmail = email.toLowerCase().trim();
      
      // @ts-ignore - Supabase typing issue
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .ilike('email', normalizedEmail)
        .single();

      if (error || !data) {
        throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
      }

      // Verificar senha com bcrypt
      const isPasswordCorrect = await bcrypt.compare(password, (data as any).password_hash);

      if (!isPasswordCorrect) {
        throw new Error(ERROR_MESSAGES.INCORRECT_PASSWORD);
      }

      const user = data as User;
      setUser(user);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } catch (error) {
      console.error('Erro ao fazer signin:', error);
      throw error;
    }
  }

  async function signOut() {
    try {
      localStorage.removeItem(STORAGE_KEYS.USER);
      setUser(null);
    } catch (error) {
      console.error('Erro ao fazer signout:', error);
      throw error;
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
}
