'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, Plus, Loader2 } from 'lucide-react';
import { fetchCategories, createCategory } from '@/lib/supabase-queries';

interface CategoryInputProps {
  value: string;
  onChange: (value: string) => void;
  userId: string;
  type: 'income' | 'expense';
  required?: boolean;
}

export default function CategoryInput({
  value,
  onChange,
  userId,
  type,
  required = false,
}: CategoryInputProps) {
  const [categories, setCategories] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [loading, setLoading] = useState(false);
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Load categories
  useEffect(() => {
    loadCategories();
  }, [userId, type]);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await fetchCategories(userId, type);
      setCategories(data);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      alert('Digite um nome para a categoria');
      return;
    }

    // Check if category already exists
    if (categories.some(cat => cat.name.toLowerCase() === newCategoryName.toLowerCase())) {
      alert('Esta categoria já existe');
      setNewCategoryName('');
      setShowNewCategory(false);
      return;
    }

    setCreatingCategory(true);
    try {
      const result = await createCategory(userId, {
        name: newCategoryName,
        type: type,
      });

      if (result.success) {
        const newCategory = result.data?.[0] || { name: newCategoryName };
        setCategories([...categories, newCategory]);
        onChange(newCategoryName);
        setNewCategoryName('');
        setShowNewCategory(false);
        setSearchTerm('');
        setShowDropdown(false);
      }
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      alert('Erro ao criar categoria');
    } finally {
      setCreatingCategory(false);
    }
  };

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const showCreateOption = 
    searchTerm.trim() && 
    !categories.some(cat => cat.name.toLowerCase() === searchTerm.toLowerCase());

  return (
    <div className="relative w-full">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Categoria
      </label>
      
      <div className="relative">
        <input
          type="text"
          value={showNewCategory ? '' : searchTerm || value}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setShowDropdown(true)}
          placeholder="Buscar ou criar categoria..."
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-500 focus:border-transparent pr-10"
        />
        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
      </div>

      {/* Dropdown Menu */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-50">
          {/* Search/Filter Input */}
          <div className="p-3 border-b border-gray-200 dark:border-gray-600">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar categoria..."
              autoFocus
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-600 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-gray-500 focus:border-transparent"
            />
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
            </div>
          ) : (
            <>
              {/* Existing Categories */}
              {filteredCategories.length > 0 && (
                <div className="max-h-48 overflow-y-auto">
                  {filteredCategories.map((cat, index) => (
                    <button
                      key={cat.id || `cat-${index}`}
                      type="button"
                      onClick={() => {
                        onChange(cat.name);
                        setSearchTerm('');
                        setShowDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-white flex items-center justify-between group"
                    >
                      <span>{cat.name}</span>
                      {value === cat.name && (
                        <span className="text-gray-500 dark:text-gray-400 text-sm">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Create New Category Option */}
              {showCreateOption && (
                <div className="border-t border-gray-200 dark:border-gray-600 p-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewCategory(true);
                      setNewCategoryName(searchTerm);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Criar "{searchTerm}"</span>
                  </button>
                </div>
              )}

              {/* No Results Message */}
              {filteredCategories.length === 0 && !showCreateOption && (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
                  Nenhuma categoria encontrada
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Create New Category Modal */}
      {showNewCategory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full shadow-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Nova Categoria
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nome da Categoria
                </label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  autoFocus
                  placeholder="Ex: Netflix, Spotify..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowNewCategory(false);
                    setNewCategoryName('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleCreateCategory}
                  disabled={creatingCategory}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-lg transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {creatingCategory && <Loader2 className="w-4 h-4 animate-spin" />}
                  Criar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Close dropdown when clicking outside */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
}
