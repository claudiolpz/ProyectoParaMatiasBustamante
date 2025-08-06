import { useState, useCallback } from 'react';
import { useSearchParams } from 'react-router';
import api from '../config/axios';
import type { Product, ProductFilters, PaginationInfo, ProductFiltersWithPage } from '../types';

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<PaginationInfo>({
    current: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  });

  const [searchParams, setSearchParams] = useSearchParams();

  // Obtener parámetros de la URL
  const getFiltersFromURL = useCallback((): ProductFiltersWithPage => {
    const orderFromURL = searchParams.get('order');
    const orderByFromURL = searchParams.get('orderBy');
    
    // Validar que order sea 'asc' o 'desc'
    const validOrder: 'asc' | 'desc' = orderFromURL === 'desc' ? 'desc' : 'asc';
    
    // Validar que orderBy sea válido
    const validOrderBy: 'name' | 'price' | 'stock' | 'category' = 
      orderByFromURL === 'price' || orderByFromURL === 'stock' || orderByFromURL === 'category' 
        ? orderByFromURL 
        : 'name';
    
    return {
      search: searchParams.get('search') || '',
      categoryId: searchParams.get('categoryId') ? parseInt(searchParams.get('categoryId')!) : undefined,
      orderBy: validOrderBy,
      order: validOrder,
      page: parseInt(searchParams.get('page') || '1'),
    };
  }, [searchParams]);

  // CORREGIDO: Actualizar URL con parámetros por defecto al final
  const updateURL = useCallback((filters: ProductFilters, page = 1) => {
    const params = new URLSearchParams();
    
    if (filters.search) params.set('search', filters.search);
    if (filters.categoryId) params.set('categoryId', filters.categoryId.toString());
    if (filters.orderBy !== 'name') params.set('orderBy', filters.orderBy);
    if (filters.order !== 'asc') params.set('order', filters.order);
    if (page !== 1) params.set('page', page.toString());

    setSearchParams(params);
  }, [setSearchParams]);

  // CORREGIDO: fetchProducts con parámetros por defecto al final
  const fetchProducts = useCallback(async (filters: ProductFilters, page = 1) => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
      });

      if (filters.search) params.append('search', filters.search);
      if (filters.categoryId) params.append('categoryId', filters.categoryId.toString());
      if (filters.orderBy) params.append('orderBy', filters.orderBy);
      if (filters.order) params.append('order', filters.order);

      const { data } = await api.get(`/products?${params.toString()}`);
      
      setProducts(data.products || []);
      setPagination({
        current: page,
        pageSize: 10,
        total: data.pagination?.total || 0,
        totalPages: data.pagination?.totalPages || 0,
      });

      updateURL(filters, page);

    } catch (error) {
      console.error('Error al cargar productos:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [updateURL]);

  return {
    products,
    loading,
    pagination,
    fetchProducts,
    getFiltersFromURL,
  };
};