'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from './supabase';

interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
}

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
      const storedUser = localStorage.getItem('poupa_user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        // Verificar se o usuário ainda existe no banco
        const { data } = await supabase
          .from('users')
          .select('*')
          .eq('id', userData.id)
          .single();

        if (data) {
          setUser(data);
        } else {
          localStorage.removeItem('poupa_user');
        }
      }
    } catch (error) {
      console.error('Erro ao verificar sessão:', error);
      localStorage.removeItem('poupa_user');
    } finally {
      setLoading(false);
    }
  }

  async function signUp(email: string, password: string, name: string) {
    try {
      // Gerar um UUID simples
      const userId = crypto.randomUUID();

      // Inserir na tabela users COM a senha
      const { data, error } = await supabase.from('users').insert([
        {
          id: userId,
          email: email.toLowerCase().trim(),
          name,
          password_hash: password, // Armazenar senha em plaintext por enquanto
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);

      if (error) throw error;

      setUser({
        id: userId,
        email,
        name,
      });

      localStorage.setItem('poupa_user', JSON.stringify({ id: userId, email, name }));
    } catch (error) {
      console.error('Erro ao fazer signup:', error);
      throw error;
    }
  }

  async function signIn(email: string, password: string) {
    try {
      // Buscar usuário pelo email (normalizado)
      const normalizedEmail = email.toLowerCase().trim();
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .ilike('email', normalizedEmail)
        .single();

      console.log('SignIn Debug:', { email: normalizedEmail, error, dataExists: !!data });

      if (error || !data) {
        console.error('Erro na query ou usuário não encontrado:', error);
        throw new Error('Usuário não encontrado');
      }

      console.log('Usuário encontrado:', { id: data.id, email: data.email });

      // Verificar senha em plaintext
      const isPasswordCorrect = data.password_hash === password;
      console.log('Comparando senhas:', { 
        stored: data.password_hash, 
        provided: password,
        match: isPasswordCorrect 
      });

      if (!isPasswordCorrect) {
        throw new Error('Senha incorreta');
      }

      setUser(data);
      localStorage.setItem('poupa_user', JSON.stringify(data));
    } catch (error) {
      console.error('Erro ao fazer signin:', error);
      throw error;
    }
  }

  async function signOut() {
    try {
      localStorage.removeItem('poupa_user');
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
