import React from 'react';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import type { SaleFiltersProps } from '../types';

const SalesFilters: React.FC<SaleFiltersProps> = ({
  onSearch,
  onCategoryFilter,
  onUserFilter,
  onDateFilter,
  onRefresh,
  categories,
  users,
  categoriesLoading,
  usersLoading,
  currentFilters
}) => (
  <div className="bg-slate-700 rounded-lg shadow-lg border border-slate-600 p-4 mb-6 select-none">
    {/* Barra de búsqueda */}
    <div className="flex flex-col lg:flex-row gap-4 mb-4">
      <div className="relative flex-1">
        <input
          type="text"
          placeholder="Buscar por producto, SKU o vendedor..."
          className="w-full pl-10 pr-4 py-2 border border-slate-500 rounded-lg bg-slate-600 text-white placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          onChange={e => onSearch(e.target.value)}
          value={currentFilters?.search || ''}
        />
        <SearchOutlined className="absolute left-3 top-3 text-slate-300" />
      </div>
      
      <button
        onClick={onRefresh}
        className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 min-w-[120px] lg:min-w-[140px]"
        title="Actualizar datos"
      >
        <ReloadOutlined className="lg:mr-2" />
        <span className="ml-2 lg:ml-0">Actualizar</span>
      </button>
    </div>

    {/* Filtros */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <select
        className="w-full px-4 py-2 border border-slate-500 rounded-lg bg-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        onChange={e => onCategoryFilter(e.target.value)}
        value={currentFilters?.categoryId || ''}
        disabled={categoriesLoading}
      >
        <option value="">Todas las categorías</option>
        {categories.map(cat => (
          <option key={cat.id} value={cat.id}>{cat.name}</option>
        ))}
      </select>

      <select
        className="w-full px-4 py-2 border border-slate-500 rounded-lg bg-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        onChange={e => onUserFilter(e.target.value)}
        value={currentFilters?.userId || ''}
        disabled={usersLoading}
      >
        <option value="">Todos los vendedores</option>
        {users.map(u => (
          <option key={u.id} value={u.id}>{u.name} {u.lastname}</option>
        ))}
      </select>

      <input
        type="date"
        placeholder="Fecha inicio"
        className="w-full px-4 py-2 border border-slate-500 rounded-lg bg-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
        onChange={e => onDateFilter(e.target.value, currentFilters?.endDate || '')}
        value={currentFilters?.startDate || ''}
      />

      <input
        type="date"
        placeholder="Fecha fin"
        className="w-full px-4 py-2 border border-slate-500 rounded-lg bg-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
        onChange={e => onDateFilter(currentFilters?.startDate || '', e.target.value)}
        value={currentFilters?.endDate || ''}
      />
    </div>
  </div>
);

export default SalesFilters;