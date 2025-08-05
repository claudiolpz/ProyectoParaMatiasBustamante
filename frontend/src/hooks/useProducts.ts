import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import api from '../config/axios';
import type { Product, ProductsResponse } from '../types';

export interface ProductFilters {
  search: string;
  categoryId?: number;
  orderBy: 'name' | 'price' | 'stock' | 'category';
  order: 'asc' | 'desc';
}

export interface PaginationState {
  current: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<PaginationState>({
    current: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  });

  const buildRequestParams = useCallback((page: number, pageSize: number, filters: ProductFilters) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: pageSize.toString(),
      orderBy: filters.orderBy,
      order: filters.order,
    });

    if (filters.search.trim()) {
      params.append('search', filters.search.trim());
    }

    if (filters.categoryId) {
      params.append('categoryId', filters.categoryId.toString());
    }

    return params;
  }, []);

  const updateProductsState = useCallback((data: ProductsResponse) => {
    setProducts(Array.isArray(data.products) ? data.products : []);
    setPagination({
      current: data.pagination.currentPage,
      pageSize: data.pagination.itemsPerPage,
      total: data.pagination.totalItems,
      totalPages: data.pagination.totalPages,
    });
  }, []);

  const handleError = useCallback((error: any) => {
    console.error('Error completo:', error);
    console.error('Response:', error.response?.data);
    console.error('Status:', error.response?.status);
    
    toast.error('Error al cargar los productos');
    setProducts([]);
  }, []);

  const fetchProducts = useCallback(async (page: number, pageSize: number, filters: ProductFilters) => {
    try {
      setLoading(true);
      
      const params = buildRequestParams(page, pageSize, filters);
      
      console.log('Parámetros enviados:', {
        page,
        limit: pageSize,
        orderBy: filters.orderBy,
        order: filters.order,
        search: filters.search,
        categoryId: filters.categoryId
      });

      const { data }: { data: ProductsResponse } = await api.get(`/products?${params}`);
      updateProductsState(data);
      
    } catch (error: any) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  }, [buildRequestParams, updateProductsState, handleError]);

  return {
    products,
    loading,
    pagination,
    fetchProducts,
  };
};