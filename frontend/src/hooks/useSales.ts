import { useState, useCallback } from 'react';
import { isAxiosError } from 'axios';
import api from '../config/axios';
import type { SellProductData, SellProductResponse, Sale, SaleFilters, PaginationInfo} from '../types';

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
  const [pagination, setPagination] = useState<PaginationInfo>({
    current: 1,
    pageSize: 10,
    total: 0,
    totalPages: 1,
  });

  const fetchSales = useCallback(async (filters: SaleFilters, page: number = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.categoryId) params.append('categoryId', filters.categoryId.toString());
      if (filters.userId) params.append('userId', filters.userId.toString());
      if (filters.productId) params.append('productId', filters.productId.toString());
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.orderBy) params.append('orderBy', filters.orderBy);
      if (filters.order) params.append('order', filters.order);
      params.append('page', page.toString());
      params.append('limit', pagination.pageSize.toString());

      // Usar axios y tu instancia api
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
        // Puedes mostrar el error del backend si lo necesitas
        console.error('Error al obtener ventas:', err.response.data.error);
      }
      setSales([]);
      setPagination(p => ({ ...p, total: 0, totalPages: 1 }));
    } finally {
      setLoading(false);
    }
  }, [pagination.pageSize]);

  return { sales, loading, pagination, fetchSales };
}