import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router';
import { SearchOutlined, CaretUpOutlined, LoginOutlined, UserAddOutlined, EyeOutlined } from '@ant-design/icons';
import { useSalesTable } from '../hooks/useSales';
import { useCategories } from '../hooks/useCategories';
import { useUsers } from '../hooks/useUsers';
import { useAuth, useAuthRoles } from '../context/AuthProvider';
import SalesFilters from '../components/SalesFilters';
import ImageModal from '../components/ImageModal';
import PaginationComponent from '../components/PaginationComponent';
import type { Sale, SaleFilters } from '../types';
import {
    getSaleRowStyle,
    getSaleImageButtonStyle,
    getSaleImagePlaceholderStyle, formatSaleDate,
    formatSalePrice
} from '../helpers/SalesTableHelpers';

const SalesTable = () => {
    const { sales, loading, pagination, fetchSales, getFiltersFromURL, updateURL } = useSalesTable();
    const { categories, loading: categoriesLoading, fetchCategories } = useCategories();
    const { users, loading: usersLoading, fetchUsers } = useUsers();
    const { handleEstaLogeado, user } = useAuth();
    const { isAdmin } = useAuthRoles();

    const [filters, setFilters] = useState<SaleFilters>(() => getFiltersFromURL());

    useEffect(() => {
        setFilters(getFiltersFromURL());
    }, [getFiltersFromURL]);


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

    // Cargar datos al montar
    useEffect(() => {
        fetchSales(filters, 1);
        fetchCategories();
        fetchUsers();
    }, [fetchSales, fetchCategories, fetchUsers]);

    // Handlers para filtros
    const handleSearch = useCallback((value: string) => {
        const newFilters: SaleFilters = { ...filters, search: value };
        setFilters(newFilters);
        updateURL(newFilters, 1);
    }, [filters, updateURL]);

    const handleCategoryFilter = useCallback((categoryId: string) => {
        const newFilters: SaleFilters = {
            ...filters,
            categoryId: categoryId ? parseInt(categoryId) : undefined
        };
        setFilters(newFilters);
        updateURL(newFilters, 1);
    }, [filters, updateURL]);

    const handleUserFilter = useCallback((userId: string) => {
        const newFilters: SaleFilters = {
            ...filters,
            userId: userId ? parseInt(userId) : undefined
        };
        setFilters(newFilters);
        updateURL(newFilters, 1);
    }, [filters, updateURL]);

    const handleDateFilter = useCallback((startDate: string, endDate: string) => {
        const newFilters: SaleFilters = { ...filters, startDate, endDate };
        setFilters(newFilters);
        updateURL(newFilters, 1);
    }, [filters, updateURL]);

    const handleSort = useCallback((field: 'createdAt' | 'totalPrice' | 'quantity' | 'unitPrice') => {
        const newOrder: 'asc' | 'desc' = filters.orderBy === field && filters.order === 'asc' ? 'desc' : 'asc';
        const newFilters: SaleFilters = {
            ...filters,
            orderBy: field,
            order: newOrder
        };
        setFilters(newFilters);
        updateURL(newFilters, pagination.current);
    }, [filters, pagination.current, updateURL]);

    const handlePageChange = useCallback((page: number) => {
        updateURL(filters, page);
    }, [updateURL, filters]);

    const handleRefresh = useCallback(() => {
        fetchSales();
        fetchCategories();
        fetchUsers();
    }, [fetchSales, fetchCategories, fetchUsers]);
    // Función para renderizar encabezados ordenables
    const renderTableHeader = () => {
        const renderSortableHeader = (field: 'createdAt' | 'totalPrice' | 'quantity' | 'unitPrice', label: string, className: string = '') => (
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
            <thead className="bg-slate-800 select-none">
                <tr>
                    {renderSortableHeader('createdAt', 'Fecha', 'min-w-[150px]')}
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider min-w-[200px]">
                        Producto
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider min-w-[100px]">
                        SKU
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider min-w-[120px]">
                        Categoría
                    </th>
                    {renderSortableHeader('quantity', 'Cantidad', 'min-w-[100px]')}
                    {renderSortableHeader('unitPrice', 'Precio Unit.', 'min-w-[120px]')}
                    {renderSortableHeader('totalPrice', 'Total', 'min-w-[120px]')}
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider min-w-[150px]">
                        Vendedor
                    </th>
                </tr>
            </thead>
        );
    };

    const renderSaleRow = (sale: Sale) => {
        return (
            <tr
                key={sale.id}
                className={getSaleRowStyle()}
            >
                {/* Fecha */}
                <td className="px-3 sm:px-6 py-6 whitespace-nowrap">
                    <span className="text-sm font-medium text-white">
                        {formatSaleDate(sale.createdAt)}
                    </span>
                </td>

                {/* Producto con imagen */}
                <td className="px-3 sm:px-6 py-6">
                    <div className="flex items-center space-x-3">
                        {sale.product.image ? (
                            <button
                                type="button"
                                onClick={() => handleImageClick(sale.product.image!, sale.product.name)}
                                className={getSaleImageButtonStyle()}
                                title="Clic para ampliar imagen"
                            >
                                <img
                                    src={sale.product.image}
                                    alt={sale.product.name}
                                    className="w-full h-full rounded-lg object-cover"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = '/placeholder-image.png';
                                    }}
                                />
                            </button>
                        ) : (
                            <div className={getSaleImagePlaceholderStyle()}>
                                <EyeOutlined className="text-slate-400 text-lg" />
                            </div>
                        )}
                        <div className="text-sm font-medium text-white break-words">
                            {sale.product.name}
                        </div>
                    </div>
                </td>

                {/* SKU */}
                <td className="px-3 sm:px-6 py-6 whitespace-nowrap">
                    {sale.product.sku ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-600 text-slate-200 border border-slate-500">
                            {sale.product.sku}
                        </span>
                    ) : (
                        <span className="text-slate-400 text-sm">Sin SKU</span>
                    )}
                </td>

                {/* Categoría */}
                <td className="px-3 sm:px-6 py-6 whitespace-nowrap">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-600 text-slate-200 border border-slate-500">
                        {sale.product.category?.name || 'Sin categoría'}
                    </span>
                </td>

                {/* Cantidad */}
                <td className="px-3 sm:px-6 py-6 whitespace-nowrap">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-900 text-white border border-blue-700">
                        {sale.quantity}
                    </span>
                </td>

                {/* Precio Unitario */}
                <td className="px-3 sm:px-6 py-6 whitespace-nowrap">
                    <span className="text-sm font-semibold text-green-400">
                        {formatSalePrice(sale.unitPrice)}
                    </span>
                </td>

                {/* Total */}
                <td className="px-3 sm:px-6 py-6 whitespace-nowrap">
                    <span className="text-sm font-bold text-green-300">
                        {formatSalePrice(sale.totalPrice)}
                    </span>
                </td>

                {/* Vendedor */}
                <td className="px-3 sm:px-6 py-6 whitespace-nowrap">
                    <div className="text-sm">
                        <div className="font-medium text-white">
                            {sale.user.name} {sale.user.lastname}
                        </div>
                        <div className="text-slate-400 text-xs">
                            {sale.user.email}
                        </div>
                    </div>
                </td>
            </tr>
        );
    };

    // Verificar si es admin
    const isUserAdmin = handleEstaLogeado() && isAdmin();

    return (
        <div className="w-full min-h-screen bg-slate-800">
            {/* Header */}
            <div className="bg-slate-900 shadow-lg border-b border-slate-700 px-4 sm:px-6 lg:px-8 py-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-white">
                                Registro de Ventas
                            </h1>
                            <p className="text-slate-300 mt-2">
                                Historial completo de transacciones (10 por página)
                            </p>
                        </div>
                    </div>

                    {/* Mensaje para usuarios no logueados */}
                    {!handleEstaLogeado() && (
                        <div className="mt-4 bg-blue-900/30 border border-blue-700/50 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <p className="text-blue-200">
                                    <span className="font-semibold">¿Quieres ver el registro de ventas?</span> Inicia sesión como administrador.
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

                    {/* Mensaje para administradores */}
                    {isUserAdmin && (
                        <div className="mt-4 bg-blue-900/30 border border-blue-700/50 rounded-lg p-4">
                            <p className="text-white">
                                <span className="font-semibold">¡Bienvenido {user?.name}!</span> Aquí puedes revisar todo el historial de ventas del sistema.
                            </p>
                        </div>
                    )}

                    {/* Mensaje para usuarios no admin */}
                    {handleEstaLogeado() && !isAdmin() && (
                        <div className="mt-4 bg-orange-900/30 border border-orange-700/50 rounded-lg p-4">
                            <p className="text-white">
                                <span className="font-semibold">Acceso restringido.</span> Solo los administradores pueden ver el registro de ventas.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Contenido principal */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {isUserAdmin ? (
                    <>
                        {/* Filtros */}
                        <SalesFilters
                            onSearch={handleSearch}
                            onCategoryFilter={handleCategoryFilter}
                            onUserFilter={handleUserFilter}
                            onDateFilter={handleDateFilter}
                            onRefresh={handleRefresh}
                            categories={categories}
                            users={users}
                            categoriesLoading={categoriesLoading}
                            usersLoading={usersLoading}
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
                                                {sales && sales.length > 0 ? (
                                                    sales.map(renderSaleRow)
                                                ) : (
                                                    <tr>
                                                        <td colSpan={8} className="px-6 py-8 text-center text-slate-400">
                                                            <div className="flex flex-col items-center space-y-2">
                                                                <SearchOutlined className="text-3xl text-slate-500" />
                                                                <span>No se encontraron ventas</span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    {sales && sales.length > 0 && (
                                        <PaginationComponent
                                            pagination={pagination}
                                            onPageChange={handlePageChange}
                                        />
                                    )}
                                </>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="bg-slate-700 rounded-lg shadow-lg border border-slate-600 p-8 text-center">
                        <SearchOutlined className="text-6xl text-slate-500 mb-4" />
                        <h3 className="text-xl font-medium text-white mb-2">Acceso Restringido</h3>
                        <p className="text-slate-400">
                            {!handleEstaLogeado()
                                ? 'Debes iniciar sesión como administrador para ver las ventas.'
                                : 'Solo los administradores pueden acceder al registro de ventas.'
                            }
                        </p>
                    </div>
                )}
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

export default SalesTable;