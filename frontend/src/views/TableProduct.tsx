import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router';
import { SearchOutlined, EditOutlined, EyeOutlined, CaretUpOutlined, LoginOutlined, UserAddOutlined, PlusCircleOutlined, PoweroffOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { useProducts } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import { useSalesFlow } from '../hooks/useSalesFlow';
import { useAuth, useAuthRoles } from '../context/AuthProvider';
import { ProductFilters as FiltersComponent } from '../components/ProductFilters';
import ImageModal from '../components/ImageModal';
import PaginationComponent from '../components/PaginationComponent';
import type { Product, ProductFilters } from '../types';
import { useToggleFlow } from '../hooks/useToggleFlow';
import {
  getProductRowStyle,
  getSellButtonStyle,
  getSellButtonTitle,
  getToggleButtonStyle,
  getToggleButtonTitle,
  isSellButtonDisabled,
  getImageButtonStyle,
  getImagePlaceholderStyle,
  getProductElementStyle,
  getStockBadgeStyleDetailed
} from '../helpers/tableProductHelpers';

const TableProduct = () => {
  const { products, loading, pagination, fetchProducts, getFiltersFromURL } = useProducts();
  const { categories, loading: categoriesLoading, fetchCategories } = useCategories();
  const { handleEstaLogeado, user } = useAuth();
  const { isAdmin } = useAuthRoles();
  const navigate = useNavigate();


  // Estado para modal de imagen
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
    isActive: 'all'
  });

  // Función para abrir modal de imagen
  const handleImageClick = useCallback((imageSrc: string, imageAlt: string) => {
    setImageModal({
      isOpen: true,
      imageSrc,
      imageAlt
    });
  }, []);

  // Función para cerrar modal de imagen
  const handleCloseImageModal = useCallback(() => {
    setImageModal({
      isOpen: false,
      imageSrc: '',
      imageAlt: ''
    });
  }, []);

  // Cargar filtros desde URL al montar
  useEffect(() => {
    const urlFilters = getFiltersFromURL();

    const validOrder: 'asc' | 'desc' = urlFilters.order === 'desc' ? 'desc' : 'asc';

    const validFilters: ProductFilters = {
      search: urlFilters.search,
      categoryId: urlFilters.categoryId,
      orderBy: urlFilters.orderBy,
      order: validOrder,
      isActive: urlFilters.isActive
    };

    setFilters(validFilters);
    fetchProducts(validFilters, urlFilters.page);
  }, [getFiltersFromURL, fetchProducts]);

  // Cargar categorías al montar
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Handlers que actualizan URL
  const handleSearch = useCallback((value: string) => {
    const newFilters: ProductFilters = { ...filters, search: value };
    setFilters(newFilters);
    fetchProducts(newFilters, 1);
  }, [filters, fetchProducts]);

  const handleCategoryFilter = useCallback((categoryId: string) => {
    const newFilters: ProductFilters = {
      ...filters,
      categoryId: categoryId ? parseInt(categoryId) : undefined
    };
    setFilters(newFilters);
    fetchProducts(newFilters, 1);
  }, [filters, fetchProducts]);

  const handleSort = useCallback((field: 'name' | 'price' | 'stock' | 'category') => {
    const newOrder: 'asc' | 'desc' = filters.orderBy === field && filters.order === 'asc' ? 'desc' : 'asc';
    const newFilters: ProductFilters = {
      ...filters,
      orderBy: field,
      order: newOrder
    };
    setFilters(newFilters);
    fetchProducts(newFilters, pagination.current);
  }, [filters, pagination.current, fetchProducts]);

  const handlePageChange = useCallback((page: number) => {
    fetchProducts(filters, page);
  }, [fetchProducts, filters]);

  const handleRefresh = useCallback(() => {
    fetchProducts(filters, pagination.current);
    fetchCategories();
  }, [fetchProducts, fetchCategories, pagination.current, filters]);

  const handleEdit = useCallback((id: number) => {
    navigate(`/products/edit/${id}`);
  }, [navigate]);

  // FUNCIÓN DE VENTA 
  const { handleSell, loading: sellLoading } = useSalesFlow({
    products,
    onRefresh: handleRefresh
  });
  //Funcion de Borrar
  const { handleToggle: handleToggleProduct, loading: toggleLoading } = useToggleFlow({
    products,
    onRefresh: handleRefresh
  });

  const handleActiveStatusFilter = useCallback((status: string) => {
    let isActiveValue: boolean | 'all';
    
    if (status === 'true') {
      isActiveValue = true;
    } else if (status === 'false') {
      isActiveValue = false;
    } else {
      isActiveValue = 'all';
    }
    
    const newFilters: ProductFilters = {
      ...filters,
      isActive: isActiveValue
    };
    setFilters(newFilters);
    fetchProducts(newFilters, 1);
  }, [filters, fetchProducts]);

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
          {/* Columna de imagen */}
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

          {/* Columna de acciones solo para admin */}
          {(handleEstaLogeado() && isAdmin()) && (
            <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider w-24">
              Acciones
            </th>
          )}
        </tr>
      </thead>
    );
  };

  const renderProductRow = (product: Product) => {
    const isUserAdmin = handleEstaLogeado() && isAdmin();

    return (
      <tr
        key={product.id}
        className={getProductRowStyle(product)}
      >
        {/* Imagen con indicador de estado - USANDO HELPER */}
        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
          {product.image ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => handleImageClick(product.image!, product.name)}
                className={getImageButtonStyle(product)}
                title="Clic para ampliar imagen"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full rounded-lg object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder-image.png';
                  }}
                />
              </button>
            </div>
          ) : (
            <div className={getImagePlaceholderStyle(product)}>
              <EyeOutlined className="text-slate-400 text-lg" />
            </div>
          )}
        </td>

        {/* Nombre con indicador de estado - USANDO HELPER */}
        <td className="px-3 sm:px-6 py-4">
          <div className="flex items-center space-x-2">
            <div className={`text-sm font-medium break-words ${getProductElementStyle(product, 'text-white', 'text-slate-400')
              }`}>
              {product.name}
            </div>
            {!product.isActive && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-orange-900 text-orange-300 border border-orange-700">
                Inactivo
              </span>
            )}
          </div>
        </td>

        {/* SKU con estilo según estado - USANDO HELPER */}
        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
          {product.sku ? (
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getProductElementStyle(
              product,
              'bg-slate-600 text-slate-200 border-slate-500',
              'bg-slate-700 text-slate-400 border-slate-600'
            )
              }`}>
              {product.sku}
            </span>
          ) : (
            <span className="text-slate-400 text-sm">Sin SKU</span>
          )}
        </td>

        {/* Categoría con estilo según estado - USANDO HELPER */}
        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getProductElementStyle(
            product,
            'bg-slate-600 text-slate-200 border-slate-500',
            'bg-slate-700 text-slate-400 border-slate-600'
          )
            }`}>
            {product.category?.name || 'Sin categoría'}
          </span>
        </td>

        {/* Precio con estilo según estado - USANDO HELPER */}
        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
          <span className={`text-sm font-semibold ${getProductElementStyle(product, 'text-green-400', 'text-green-500/60')
            }`}>
            ${product.price.toLocaleString('es-CL')}
          </span>
        </td>

        {/* STOCK CON HELPER - Sin ternarios anidados */}
        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStockBadgeStyleDetailed(product)}`}>
            {product.stock}
          </span>
        </td>

        {/* Acciones con botón toggle en vez de eliminar */}
        {isUserAdmin && (
          <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
            <div className="flex items-center space-x-1">
              {/* Botón de venta */}
              <button
                onClick={() => handleSell(product.id)}
                disabled={isSellButtonDisabled(product, sellLoading)}
                className={`p-1.5 rounded-lg transition-colors duration-200 border ${getSellButtonStyle(product, sellLoading)}`}
                title={getSellButtonTitle(product, sellLoading)}
              >
                <ShoppingCartOutlined className="text-sm" />
              </button>

              {/* Botón de editar */}
              <button
                onClick={() => handleEdit(product.id)}
                className="p-1.5 text-blue-400 hover:bg-slate-600 hover:text-blue-300 rounded-lg transition-colors duration-200 border border-slate-500 hover:border-blue-400"
                title="Editar producto"
              >
                <EditOutlined className="text-sm" />
              </button>

              {/* Botón de toggle */}
              <button
                onClick={() => handleToggleProduct(product.id)}
                disabled={toggleLoading}
                className={`p-1.5 rounded-lg transition-colors duration-200 border ${getToggleButtonStyle(product, toggleLoading)}`}
                title={getToggleButtonTitle(product, toggleLoading)}
              >
                <PoweroffOutlined className="text-sm" />
              </button>
            </div>
          </td>
        )}
      </tr>
    );
  };

  return (
    <div className="w-full min-h-screen bg-slate-800">
      {/* Header */}
      <div className="bg-slate-900 shadow-lg border-b border-slate-700 px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                {handleEstaLogeado() && isAdmin() ? 'Gestión de Productos' : 'Catálogo de Productos'}
              </h1>
              <p className="text-slate-300 mt-2">
                {handleEstaLogeado() && isAdmin()
                  ? 'Administra tu inventario de productos'
                  : 'Explora nuestro catálogo de productos'
                } (10 por página)
              </p>
            </div>              
            {/* Botón Crear Producto solo para admin */}
            {handleEstaLogeado() && isAdmin() && (
              <Link
                to="/products/create"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-lg"
              >
                <span className="mr-2"><PlusCircleOutlined /> Crear Producto</span>
              </Link>
            )}
          </div>

          {/* Mensaje para usuarios no logueados */}
          {!handleEstaLogeado() && (
            <div className="mt-4 bg-blue-900/30 border border-blue-700/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <p className="text-blue-200">
                  <span className="font-semibold">¿Quieres administrar productos?</span> Inicia sesión para acceder a todas las funcionalidades.
                </p>
                <div className="flex items-center space-x-2 ml-4">
                  <Link
                    to="/auth/login"
                    className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors duration-200"
                  >
                    <LoginOutlined className="mr-1.5" />
                    Iniciar Sesión
                  </Link>
                  <Link
                    to="/auth/register"
                    className="inline-flex items-center px-3 py-1.5 bg-slate-600 text-white text-sm font-medium rounded-md hover:bg-slate-700 transition-colors duration-200"
                  >
                    <UserAddOutlined className="mr-1.5" />
                    Registrarse
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Mensaje para usuarios logueados y administradores */}
          {handleEstaLogeado() && isAdmin() && (
            <div className="mt-4 bg-blue-900/30 border border-blue-700/50 rounded-lg p-4">
              <p className="text-white">
                <span className="font-semibold">¡Bienvenido {user?.name}!</span> Como Admin tienes acceso completo
                para gestionar productos, categorías y realizar todas las operaciones del sistema.
              </p>
            </div>
          )}

          {/* Mensaje para usuarios logueados pero no admin */}
          {handleEstaLogeado() && !isAdmin() && (
            <div className="mt-4 bg-blue-900/30 border border-blue-700/50 rounded-lg p-4">
              <p className="text-white">
                <span className="font-semibold">Hola {user?.name}!</span> Estás viendo el catálogo como usuario.
                Solo los administradores pueden gestionar los productos.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filtros */}
        <FiltersComponent
          onSearch={handleSearch}
          onCategoryFilter={handleCategoryFilter}
          onActiveStatusFilter={handleActiveStatusFilter}
          onRefresh={handleRefresh}
          categories={categories}
          categoriesLoading={categoriesLoading}
          showActiveFilter={handleEstaLogeado() && isAdmin()}
          currentFilters={filters}
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
                        <td colSpan={handleEstaLogeado() && isAdmin() ? 7 : 6} className="px-6 py-8 text-center text-slate-400">
                          <div className="flex flex-col items-center space-y-2">
                            <SearchOutlined className="text-3xl text-slate-500" />
                            <span>No se encontraron productos</span>
                            {!handleEstaLogeado() && (
                              <p className="text-sm text-slate-500 mt-2">
                                <Link to="/auth/login" className="text-blue-400 hover:text-blue-300">
                                  Inicia sesión
                                </Link> para ver más opciones
                              </p>
                            )}
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

      {/* Modal para mostrar imagen ampliada */}
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