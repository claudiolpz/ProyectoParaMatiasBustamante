import { useState } from 'react';
import { isAxiosError } from 'axios';
import api from '../config/axios';
import type { DeleteProductData, DeleteProductResponse } from '../types';

export const useProductDelete = () => {
  const [loading, setLoading] = useState(false);

  const deleteProduct = async (data: DeleteProductData): Promise<DeleteProductResponse> => {
    setLoading(true);
    try {
      const { data: result } = await api.delete<DeleteProductResponse>(
        `products/${data.productId}`
      );

      return result;
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      
      if (isAxiosError(error) && error.response) {
        throw new Error(error.response.data.error || 'Error al eliminar el producto');
      }
      
      throw new Error('Error de conexión al eliminar el producto');
    } finally {
      setLoading(false);
    }
  };

  return {
    deleteProduct,
    loading,
  };
};