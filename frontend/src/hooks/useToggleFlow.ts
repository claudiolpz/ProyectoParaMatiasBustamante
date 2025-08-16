import { useCallback } from 'react';
import { toast } from 'sonner';
import { useProductToggle } from './useProductToggle';
import {
  showToggleConfirmationModal,
  showToggleSuccessModal,
  showErrorModal
} from '../utils/productModals';
import type { UseToggleFlowProps } from '../types';



export const useToggleFlow = ({ products, onRefresh }: UseToggleFlowProps) => {
  const { toggleStatus, loading } = useProductToggle();

  const handleToggle = useCallback(async (productId: number) => {
    try {
      // Buscar producto
      const product = products?.find(p => p.id === productId);
      if (!product) {
        toast.error('Producto no encontrado');
        return;
      }

      // Mostrar modal de confirmación
      const isConfirmed = await showToggleConfirmationModal(product);
      if (!isConfirmed) return;

      // Cambiar estado del producto
      const result = await toggleStatus({ productId });

      // Mostrar resultado exitoso
      await showToggleSuccessModal(result);

      // Refrescar lista
      onRefresh();
      
    } catch (error: any) {
      const errorMessage = error.message || 'Error al cambiar estado del producto';
      toast.error(errorMessage);
      await showErrorModal(errorMessage);
    }
  }, [products, toggleStatus, onRefresh]);

  return {
    handleToggle,
    loading
  };
};