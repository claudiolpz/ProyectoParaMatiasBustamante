import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { SearchOutlined, EditOutlined, DeleteOutlined, EyeOutlined, CaretUpOutlined } from '@ant-design/icons';
import { toast } from 'sonner';
import { useProducts } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import { ProductFilters as FiltersComponent } from '../components/ProductFilters';
import ImageModal from '../components/ImageModal';
import PaginationComponent from '../components/PaginationComponent';
import type { Product, ProductFilters } from '../types';

const TableProduct = () => {
  const { products, loading, pagination, fetchProducts, getFiltersFromURL } = useProducts();
  const { categories, loading: categoriesLoading, fetchCategories } = useCategories();
  const navigate = useNavigate();

  // NUEVO: Estado para modal de imagen
  const [imageModal, setImageModal] = useState<{
    isOpen: boolean;
    imageSrc: string;
    imageAlt: string;
  }>({
    isOpen: false,
    imageSrc: '',
    imageAlt: ''
  });

  const [filters, setFilters] = useState<ProductFilters>({
    search: '',
    categoryId: undefined,
    orderBy: 'name',
    order: 'asc',
  });

  // NUEVO: Función para abrir modal de imagen
  const handleImageClick = useCallback((imageSrc: string, imageAlt: string) => {
    setImageModal({
      isOpen: true,
      imageSrc,
      imageAlt
    });
  }, []);

  // NUEVO: Función para cerrar modal de imagen
  const handleCloseImageModal = useCallback(() => {
    setImageModal({
      isOpen: false,
      imageSrc: '',
      imageAlt: ''
    });
  }, []);

  // CORREGIDO: Cargar filtros desde URL al montar con nuevo orden de parámetros
  useEffect(() => {
    const urlFilters = getFiltersFromURL();

    // Validar que order sea 'asc' o 'desc'
    const validOrder: 'asc' | 'desc' = urlFilters.order === 'desc' ? 'desc' : 'asc';

    const validFilters: ProductFilters = {
      search: urlFilters.search,
      categoryId: urlFilters.categoryId,
      orderBy: urlFilters.orderBy,
      order: validOrder,
    };

    setFilters(validFilters);

    // CORREGIDO: fetchProducts(filters, page) - nuevo orden
    fetchProducts(validFilters, urlFilters.page);
  }, [getFiltersFromURL, fetchProducts]);

  // Cargar categorías al montar
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // CORREGIDO: Handlers que actualizan URL con nuevo orden de parámetros
  const handleSearch = useCallback((value: string) => {
    const newFilters: ProductFilters = { ...filters, search: value };
    setFilters(newFilters);
    fetchProducts(newFilters, 1); // CORREGIDO: (filters, page)
  }, [filters, fetchProducts]);

  const handleCategoryFilter = useCallback((categoryId: string) => {
    const newFilters: ProductFilters = {
      ...filters,
      categoryId: categoryId ? parseInt(categoryId) : undefined
    };
    setFilters(newFilters);
    fetchProducts(newFilters, 1); // CORREGIDO: (filters, page)
  }, [filters, fetchProducts]);

  const handleSort = useCallback((field: 'name' | 'price' | 'stock' | 'category') => {
    const newOrder: 'asc' | 'desc' = filters.orderBy === field && filters.order === 'asc' ? 'desc' : 'asc';
    const newFilters: ProductFilters = {
      ...filters,
      orderBy: field,
      order: newOrder
    };
    setFilters(newFilters);
    fetchProducts(newFilters, pagination.current); // CORREGIDO: (filters, page)
  }, [filters, pagination.current, fetchProducts]);

  const handlePageChange = useCallback((page: number) => {
    fetchProducts(filters, page); // CORREGIDO: (filters, page)
  }, [fetchProducts, filters]);

  const handleRefresh = useCallback(() => {
    fetchProducts(filters, pagination.current); // CORREGIDO: (filters, page)
    fetchCategories();
  }, [fetchProducts, fetchCategories, pagination.current, filters]);

  const handleEdit = useCallback((id: number) => {
    navigate(`/products/edit/${id}`);
  }, [navigate]);

  const handleDelete = useCallback((id: number) => {
    console.log('Eliminar producto:', id);
    toast.info('Función de eliminación en desarrollo');
  }, []);

  // Función para renderizar encabezados ordenables
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
          {/* ACTUALIZADO: Columna de imagen más ancha */}
          <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider w-20">
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
      {/* ACTUALIZADO: Imagen más grande y clickeable */}
      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover border border-slate-500 cursor-pointer hover:border-slate-400 hover:shadow-lg transition-all duration-200"
            onClick={() => handleImageClick(product.image!, product.name)}
            title="Clic para ampliar imagen"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder-image.png';
            }}
          />
        ) : (
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-600 rounded-lg flex items-center justify-center border border-slate-500">
            <EyeOutlined className="text-slate-400 text-lg" />
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
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${product.stock > 0
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
          <p className="text-slate-300 mt-2">Administra tu inventario de productos (10 por página)</p>
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
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* NUEVO: Modal para mostrar imagen ampliada */}
      <ImageModal
        isOpen={imageModal.isOpen}
        onClose={handleCloseImageModal}
        imageSrc={imageModal.imageSrc}
        imageAlt={imageModal.imageAlt}
      />
    </div>
  );
};

export default TableProduct;