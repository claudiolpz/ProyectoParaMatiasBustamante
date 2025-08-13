import { useState } from 'react';
import { isAxiosError } from 'axios';
import api from '../config/axios';
import type { SellProductData, SellProductResponse } from '../types';

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