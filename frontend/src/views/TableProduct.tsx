import { useState, useEffect, useCallback } from 'react';
import { SearchOutlined, EditOutlined, DeleteOutlined, EyeOutlined, LeftOutlined, RightOutlined, CaretUpOutlined } from '@ant-design/icons';
import { toast } from 'sonner';
import { useProducts, type ProductFilters } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import { ProductFilters as FiltersComponent } from '../components/ProductFilters';
import type { Product, PaginationProps } from '../types';

// Componente de paginación (se puede mover a components/ después)
const PaginationComponent = ({ pagination, onPageChange, onPageSizeChange }: PaginationProps) => {
  const startItem = (pagination.current - 1) * pagination.pageSize + 1;
  const endItem = Math.min(pagination.current * pagination.pageSize, pagination.total);
  
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    const startPage = Math.max(1, pagination.current - Math.floor(maxVisible / 2));
    const endPage = Math.min(pagination.totalPages, startPage + maxVisible - 1);
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-between px-6 py-4 bg-slate-700 border-t border-slate-600">
      <div className="flex items-center space-x-4">
        <span className="text-sm text-slate-300">
          Mostrando {startItem} a {endItem} de {pagination.total} productos
        </span>
        <select
          value={pagination.pageSize}
          onChange={(e) => onPageSizeChange(parseInt(e.target.value))}
          className="border border-slate-500 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 bg-slate-600 text-slate-200"
        >
          <option value={10}>10 por página</option>
          <option value={20}>20 por página</option>
          <option value={50}>50 por página</option>
          <option value={100}>100 por página</option>
        </select>
      </div>
      
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onPageChange(pagination.current - 1)}
          disabled={pagination.current === 1}
          className="p-2 rounded-md border border-slate-500 bg-slate-600 text-slate-300 hover:bg-slate-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <LeftOutlined />
        </button>
        
        {getPageNumbers().map(page => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-3 py-1 rounded-md border text-sm font-medium transition-colors ${
              page === pagination.current
                ? 'bg-slate-500 text-white border-slate-400'
                : 'bg-slate-600 text-slate-300 border-slate-500 hover:bg-slate-500'
            }`}
          >
            {page}
          </button>
        ))}
        
        <button
          onClick={() => onPageChange(pagination.current + 1)}
          disabled={pagination.current === pagination.totalPages}
          className="p-2 rounded-md border border-slate-500 bg-slate-600 text-slate-300 hover:bg-slate-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <RightOutlined />
        </button>
      </div>
    </div>
  );
};

const TableProduct = () => {
  const { products, loading, pagination, fetchProducts } = useProducts();
  const { categories, loading: categoriesLoading, fetchCategories } = useCategories();
  
  const [filters, setFilters] = useState<ProductFilters>({
    search: '',
    categoryId: undefined,
    orderBy: 'name',
    order: 'asc',
  });

  // Cargar datos iniciales
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchProducts(1, pagination.pageSize, filters);
  }, [filters, fetchProducts, pagination.pageSize]);

  // Handlers simplificados
  const handleSearch = useCallback((value: string) => {
    setFilters(prev => ({ ...prev, search: value }));
  }, []);

  const handleCategoryFilter = useCallback((categoryId: string) => {
    setFilters(prev => ({ 
      ...prev, 
      categoryId: categoryId ? parseInt(categoryId) : undefined 
    }));
  }, []);

  const handleSort = useCallback((field: 'name' | 'price' | 'stock' | 'category') => {
    const newOrder = filters.orderBy === field && filters.order === 'asc' ? 'desc' : 'asc';
    setFilters(prev => ({ ...prev, orderBy: field, order: newOrder }));
  }, [filters.orderBy, filters.order]);

  const handlePageChange = useCallback((page: number) => {
    fetchProducts(page, pagination.pageSize, filters);
  }, [fetchProducts, pagination.pageSize, filters]);

  const handlePageSizeChange = useCallback((pageSize: number) => {
    fetchProducts(1, pageSize, filters);
  }, [fetchProducts, filters]);

  const handleRefresh = useCallback(() => {
    fetchProducts(1, pagination.pageSize, filters);
    fetchCategories();
  }, [fetchProducts, fetchCategories, pagination.pageSize, filters]);

  const handleEdit = useCallback((id: number) => {
    console.log('Editar producto:', id);
    toast.info('Función de edición en desarrollo');
  }, []);

  const handleDelete = useCallback((id: number) => {
    console.log('Eliminar producto:', id);
    toast.info('Función de eliminación en desarrollo');
  }, []);

  const renderTableHeader = () => {
    const renderSortableHeader = (field: 'name' | 'price' | 'stock' | 'category', label: string, className: string = '') => (
      <th 
        key={field}
        className={`px-3 sm:px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider cursor-pointer hover:bg-slate-700 transition-colors ${className}`}
        onClick={() => handleSort(field)}
        title={`Ordenar por ${label.toLowerCase()}`}
      >
        <div className="flex items-center space-x-1">
          <span>{label}</span>
          {filters.orderBy === field && (
            <span className={`transform transition-transform text-slate-400 ${filters.order === 'asc' ? 'rotate-0' : 'rotate-180'}`}>
              <CaretUpOutlined />
            </span>
          )}
        </div>
      </th>
    );

    return (
      <thead className="bg-slate-800">
        <tr>
          <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider w-16">
            Imagen
          </th>
          {renderSortableHeader('name', 'Nombre', 'min-w-[150px]')}
          <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider min-w-[100px]">
            SKU
          </th>
          {renderSortableHeader('category', 'Categoría', 'min-w-[120px]')}
          {renderSortableHeader('price', 'Precio', 'min-w-[100px]')}
          {renderSortableHeader('stock', 'Stock', 'min-w-[100px]')}
          <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider w-24">
            Acciones
          </th>
        </tr>
      </thead>
    );
  };

  const renderProductRow = (product: Product) => (
    <tr key={product.id} className="hover:bg-slate-600 transition-colors">
      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover border border-slate-500"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder-image.png';
            }}
          />
        ) : (
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-600 rounded-lg flex items-center justify-center border border-slate-500">
            <EyeOutlined className="text-slate-400 text-sm" />
          </div>
        )}
      </td>
      <td className="px-3 sm:px-6 py-4">
        <div className="text-sm font-medium text-white break-words">{product.name}</div>
      </td>
      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
        {product.sku ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-600 text-slate-200 border border-slate-500">
            {product.sku}
          </span>
        ) : (
          <span className="text-slate-400 text-sm">Sin SKU</span>
        )}
      </td>
      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-600 text-slate-200 border border-slate-500">
          {product.category?.name || 'Sin categoría'}
        </span>
      </td>
      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
        <span className="text-sm font-semibold text-green-400">
          ${product.price.toLocaleString('es-CL')}
        </span>
      </td>
      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
          product.stock > 0 
            ? 'bg-green-900 text-green-300 border border-green-700' 
            : 'bg-red-900 text-red-300 border border-red-700'
        }`}>
          {product.stock}
        </span>
      </td>
      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
        <div className="flex items-center space-x-1">
          <button
            onClick={() => console.log('Ver producto:', product.id)}
            className="p-1.5 text-slate-300 hover:bg-slate-600 hover:text-white rounded-lg transition-colors duration-200 border border-slate-500 hover:border-slate-400"
            title="Ver producto"
          >
            <EyeOutlined className="text-sm" />
          </button>
          
          <button
            onClick={() => handleEdit(product.id)}
            className="p-1.5 text-blue-400 hover:bg-slate-600 hover:text-blue-300 rounded-lg transition-colors duration-200 border border-slate-500 hover:border-blue-400"
            title="Editar producto"
          >
            <EditOutlined className="text-sm" />
          </button>
          
          <button
            onClick={() => handleDelete(product.id)}
            className="p-1.5 text-red-400 hover:bg-slate-600 hover:text-red-300 rounded-lg transition-colors duration-200 border border-slate-500 hover:border-red-400"
            title="Eliminar producto"
          >
            <DeleteOutlined className="text-sm" />
          </button>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="w-full min-h-screen bg-slate-800">
      {/* Header */}
      <div className="bg-slate-900 shadow-lg border-b border-slate-700 px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Gestión de Productos</h1>
          <p className="text-slate-300 mt-2">Administra tu inventario de productos</p>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Filtros */}
        <FiltersComponent
          onSearch={handleSearch}
          onCategoryFilter={handleCategoryFilter}
          onRefresh={handleRefresh}
          categories={categories}
          categoriesLoading={categoriesLoading}
        />

        {/* Tabla */}
        <div className="bg-slate-700 rounded-lg shadow-lg border border-slate-600 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-400"></div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full divide-y divide-slate-600">
                  {renderTableHeader()}
                  <tbody className="bg-slate-700 divide-y divide-slate-600">
                    {products && products.length > 0 ? (
                      products.map(renderProductRow)
                    ) : (
                      <tr>
                        <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                          <div className="flex flex-col items-center space-y-2">
                            <SearchOutlined className="text-3xl text-slate-500" />
                            <span>No se encontraron productos</span>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              {products && products.length > 0 && (
                <PaginationComponent 
                  pagination={pagination}
                  onPageChange={handlePageChange}
                  onPageSizeChange={handlePageSizeChange}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TableProduct;