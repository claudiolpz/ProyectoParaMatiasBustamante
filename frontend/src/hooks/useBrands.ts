import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import api from '../config/axios';
import type { Brand } from '../types';

export const useBrands = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(false);

  const processResponse = useCallback((responseData: any): Brand[] => {
    let brandsData = responseData;
    
    if (responseData.data) {
      brandsData = responseData.data;
    }
    
    if (responseData.brands) {
      brandsData = responseData.brands;
    }
    
    return Array.isArray(brandsData) ? brandsData : [];
  }, []);

  const fetchBrands = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/brands');
      const processedBrands = processResponse(response.data);
      setBrands(processedBrands);
    } catch (error: any) {
      console.error('Error al cargar marcas:', error);
      setBrands([]);
      toast.error('Error al cargar las marcas');
    } finally {
      setLoading(false);
    }
  }, [processResponse]);

  const createBrand = useCallback(async (name: string) => {
    try {
      const response = await api.post('/brands', { name });
      
      if (response.data.brand) {
        setBrands(prev => [...prev, response.data.brand].sort((a, b) => a.name.localeCompare(b.name)));
        toast.success('Marca creada exitosamente');
        return response.data.brand;
      }
    } catch (error: any) {
      console.error('Error al crear marca:', error);
      const errorMessage = error.response?.data?.error || 'Error al crear la marca';
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  return {
    brands,
    loading,
    fetchBrands,
    createBrand
  };
};
