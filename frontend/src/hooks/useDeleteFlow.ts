import { useCallback } from 'react';
import { toast } from 'sonner';
import { useProductDelete } from './useProductDelete';
import {
  showDeleteConfirmationModal,
  showDeleteSuccessModal,
  showErrorModal
} from '../utils/productModals';
import type { Product } from '../types';

interface UseDeleteFlowProps {
  products: Product[] | undefined;
  onRefresh: () => void;
}

export const useDeleteFlow = ({ products, onRefresh }: UseDeleteFlowProps) => {
  const { deleteProduct, loading } = useProductDelete();

  const handleDelete = useCallback(async (productId: number) => {
    try {
      // 1. Buscar producto
      const product = products?.find(p => p.id === productId);
      if (!product) {
        toast.error('Producto no encontrado');
        return;
      }

      // 2. Mostrar modal de confirmación
      const isConfirmed = await showDeleteConfirmationModal(product);
      if (!isConfirmed) return;

      // 3. Eliminar producto
      const result = await deleteProduct({
        productId
      });

      // 4. Mostrar resultado exitoso
      await showDeleteSuccessModal(result);

      // 5. Refrescar lista
      onRefresh();
      
    } catch (error: any) {
      const errorMessage = error.message || 'Error al eliminar el producto';
      toast.error(errorMessage);
      await showErrorModal(errorMessage);
    }
  }, [products, deleteProduct, onRefresh]);

  return {
    handleDelete,
    loading
  };
};