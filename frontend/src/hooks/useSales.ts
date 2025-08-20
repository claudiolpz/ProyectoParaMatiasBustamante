import { useState, useCallback, useEffect } from 'react';
import { isAxiosError } from 'axios';
import api from '../config/axios';
import type { SellProductData, SellProductResponse, Sale, SaleFilters, PaginationInfo} from '../types';
import { useSearchParams } from 'react-router';

export const useSales = () => {
  const [loading, setLoading] = useState(false);

  const sellProduct = async (data: SellProductData): Promise<SellProductResponse> => {
    setLoading(true);
    try {
      const { data: result } = await api.patch<SellProductResponse>(
        `products/${data.productId}/sell`,
        { quantity: data.quantity }
      );

      return result;
    } catch (error) {
      console.error('Error en venta:', error);
      
      if (isAxiosError(error) && error.response) {
        throw new Error(error.response.data.error || 'Error al procesar la venta');
      }
      
      throw new Error('Error de conexión al procesar la venta');
    } finally {
      setLoading(false);
    }
  };

  return {
    sellProduct,
    loading,
  };
};

export function useSalesTable() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [pagination, setPagination] = useState<PaginationInfo>({
    current: 1,
    pageSize: 10,
    total: 0,
    totalPages: 1,
  });

  // FUNCIÓN PARA LEER FILTROS DESDE URL
  const getFiltersFromURL = useCallback((): SaleFilters => {
    return {
      search: searchParams.get('search') || '',
      categoryId: searchParams.get('categoryId') ? parseInt(searchParams.get('categoryId')!) : undefined,
      userId: searchParams.get('userId') ? parseInt(searchParams.get('userId')!) : undefined,
      productId: searchParams.get('productId') ? parseInt(searchParams.get('productId')!) : undefined,
      startDate: searchParams.get('startDate') || '',
      endDate: searchParams.get('endDate') || '',
      orderBy: searchParams.get('orderBy') || 'createdAt',
      order: (searchParams.get('order') as 'asc' | 'desc') || 'desc'
    };
  }, [searchParams]);

  // FUNCIÓN PARA ACTUALIZAR URL CON FILTROS
  const updateURL = useCallback((filters: SaleFilters, page: number = 1) => {
    const params = new URLSearchParams();
    
    if (filters.search) params.set('search', filters.search);
    if (filters.categoryId) params.set('categoryId', filters.categoryId.toString());
    if (filters.userId) params.set('userId', filters.userId.toString());
    if (filters.productId) params.set('productId', filters.productId.toString());
    if (filters.startDate) params.set('startDate', filters.startDate);
    if (filters.endDate) params.set('endDate', filters.endDate);
    if (filters.orderBy) params.set('orderBy', filters.orderBy);
    if (filters.order) params.set('order', filters.order);
    if (page > 1) params.set('page', page.toString());

    setSearchParams(params);
  }, [setSearchParams]);

  // FUNCIÓN PARA HACER LA LLAMADA A LA API
  const fetchSales = useCallback(async (filters?: SaleFilters, page?: number) => {
    setLoading(true);
    try {
      // Si no se pasan filtros, los leemos de la URL
      const currentFilters = filters || getFiltersFromURL();
      const currentPage = page || parseInt(searchParams.get('page') || '1');

      const params = new URLSearchParams();
      if (currentFilters.search) params.append('search', currentFilters.search);
      if (currentFilters.categoryId) params.append('categoryId', currentFilters.categoryId.toString());
      if (currentFilters.userId) params.append('userId', currentFilters.userId.toString());
      if (currentFilters.productId) params.append('productId', currentFilters.productId.toString());
      if (currentFilters.startDate) params.append('startDate', currentFilters.startDate);
      if (currentFilters.endDate) params.append('endDate', currentFilters.endDate);
      if (currentFilters.orderBy) params.append('orderBy', currentFilters.orderBy);
      if (currentFilters.order) params.append('order', currentFilters.order);
      params.append('page', currentPage.toString());
      params.append('limit', pagination.pageSize.toString());

      const { data } = await api.get(`/sales?${params.toString()}`);

      setSales(data.sales || []);
      setPagination({
        current: data.pagination.currentPage,
        pageSize: data.pagination.itemsPerPage,
        total: data.pagination.totalItems,
        totalPages: data.pagination.totalPages,
      });
    } catch (err) {
      if (isAxiosError(err) && err.response) {
        console.error('Error al obtener ventas:', err.response.data.error);
      }
      setSales([]);
      setPagination(p => ({ ...p, total: 0, totalPages: 1 }));
    } finally {
      setLoading(false);
    }
  }, [searchParams, getFiltersFromURL, pagination.pageSize]);

  // CARGAR DATOS AL MONTAR EL COMPONENTE (con filtros de URL)
  useEffect(() => {
    fetchSales();
  }, [searchParams]); // Se ejecuta cuando cambia la URL

  return { 
    sales, 
    loading, 
    pagination, 
    fetchSales,
    getFiltersFromURL,
    updateURL
  };
}