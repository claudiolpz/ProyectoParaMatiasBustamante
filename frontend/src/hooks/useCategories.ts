import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import api from '../config/axios';
import type { Category } from '../types';

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  const processResponse = useCallback((responseData: any): Category[] => {
    let categoriesData = responseData;
    
    if (responseData.data) {
      categoriesData = responseData.data;
    }
    
    if (responseData.categories) {
      categoriesData = responseData.categories;
    }
    
    return Array.isArray(categoriesData) ? categoriesData : [];
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/categories');
      const processedCategories = processResponse(response.data);
      setCategories(processedCategories);
    } catch (error: any) {
      console.error('Error al cargar categorías:', error);
      setCategories([]);
      toast.error('Error al cargar las categorías');
    } finally {
      setLoading(false);
    }
  }, [processResponse]);

  return {
    categories,
    loading,
    fetchCategories,
  };
};