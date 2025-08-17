import React from 'react';
import { SearchOutlined } from '@ant-design/icons';
import type { ProductFiltersProps } from '../types';

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  onSearch,
  onCategoryFilter,
  onActiveStatusFilter,
  categories,
  categoriesLoading,
  showActiveFilter = false,
  currentFilters
}) => {
  const getSelectValue = () => {
    if (currentFilters?.isActive === true) return 'true';
    if (currentFilters?.isActive === false) return 'false';
    return 'all';
  };

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
        {/* Primera fila - Búsqueda */}
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Buscar por nombre, SKU o categoría..."
            className="w-full pl-10 pr-4 py-2 border border-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent bg-slate-600 text-white placeholder-slate-300"
            onChange={(e) => onSearch(e.target.value)}
            value={currentFilters?.search || ''}
          />
          <SearchOutlined className="absolute left-3 top-3 text-slate-300" />
        </div>
        {/* Segunda fila - Filtros */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Filtro por categoría */}
          <div className="flex-1 min-w-0">
            <select
              className="w-full px-4 py-2 border border-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 bg-slate-600 text-white"
              onChange={(e) => onCategoryFilter(e.target.value)}
              value={currentFilters?.categoryId || ''}
              disabled={categoriesLoading}
            >
              <option value="" className="bg-slate-600">
                {categoriesLoading ? 'Cargando categorías...' : 'Todas las categorías'}
              </option>
              {renderCategoryOptions()}
            </select>
          </div>

          {showActiveFilter && (
            <div className="flex-1 min-w-0 sm:max-w-xs">
              <select
                className="w-full px-4 py-2 border border-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 bg-slate-600 text-white"
                onChange={(e) => onActiveStatusFilter(e.target.value)}
                value={getSelectValue()}
              >
                <option value="all" className="bg-slate-600">
                  Todos los productos
                </option>
                <option value="true" className="bg-slate-600">
                  Solo productos activos
                </option>
                <option value="false" className="bg-slate-600">
                  Solo productos inactivos
                </option>
              </select>
            </div>
          )}
        </div>
      </div >
    </div >
  );
};