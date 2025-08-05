import React from 'react';
import { SearchOutlined } from '@ant-design/icons';
import type { Category } from '../types';

interface ProductFiltersProps {
  onSearch: (value: string) => void;
  onCategoryFilter: (categoryId: string) => void;
  onRefresh: () => void;
  categories: Category[];
  categoriesLoading: boolean;
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  onSearch,
  onCategoryFilter,
  onRefresh,
  categories,
  categoriesLoading
}) => {
  const renderCategoryOptions = () => {
    if (categoriesLoading) {
      return <option value="" className="bg-slate-600">Cargando categorías...</option>;
    }

    if (categories.length === 0) {
      return <option value="" disabled className="bg-slate-600">No hay categorías disponibles</option>;
    }

    return categories.map((category) => (
      <option key={category.id} value={category.id} className="bg-slate-600">
        {category.name}
      </option>
    ));
  };

  return (
    <div className="bg-slate-700 rounded-lg shadow-lg border border-slate-600 p-4 mb-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 min-w-0">
          <input
            type="text"
            placeholder="Buscar por nombre, SKU o categoría..."
            className="w-full pl-10 pr-4 py-2 border border-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent bg-slate-600 text-white placeholder-slate-300"
            onChange={(e) => onSearch(e.target.value)}
          />
          <SearchOutlined className="absolute left-3 top-3 text-slate-300" />
        </div>
        
        <select
          className="px-4 py-2 border border-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 bg-slate-600 text-white min-w-0 sm:min-w-[200px]"
          onChange={(e) => onCategoryFilter(e.target.value)}
          defaultValue=""
          disabled={categoriesLoading}
        >
          <option value="" className="bg-slate-600">
            {categoriesLoading ? 'Cargando categorías...' : 'Todas las categorías'}
          </option>
          {renderCategoryOptions()}
        </select>

        <button
          onClick={onRefresh}
          className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-500 transition-colors duration-200 flex items-center justify-center space-x-2 whitespace-nowrap border border-slate-500 hover:border-slate-400"
        >
          <SearchOutlined />
          <span>Actualizar</span>
        </button>
      </div>
    </div>
  );
};