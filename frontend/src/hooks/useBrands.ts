import { useCallback } from 'react';
import { toast } from 'sonner';
import api from '../config/axios';
import { useFetchList } from './useFetchList';
import type { Brand } from '../types';

export const useBrands = () => {
    const { items: brands, loading, fetchItems: fetchBrands } = useFetchList<Brand>(
        '/brands',
        'brands',
        'Error al cargar las marcas'
    );

    const createBrand = useCallback(async (name: string) => {
        try {
            const response = await api.post('/brands', { name });
            if (response.data.brand) {
                toast.success('Marca creada exitosamente');
                return response.data.brand;
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.error || 'Error al crear la marca';
            toast.error(errorMessage);
            throw error;
        }
    }, []);

    return { brands, loading, fetchBrands, createBrand };
};
