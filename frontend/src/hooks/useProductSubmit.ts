import { useState, useCallback } from 'react';
import { useTransaction } from './useTransaction';

export const useProductSubmit = (isEditing: boolean = false) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { 
        transactionId, 
        isLoading: transactionLoading, 
        startTransaction,
        completeTransaction,
        clearTransaction 
    } = useTransaction(isEditing ? 'update' : 'create');

    const handleSubmit = useCallback(async (submitFunction: (transactionId?: string) => Promise<any>) => {
        if (isSubmitting) return;

        try {
            setIsSubmitting(true);
            
            // Si no hay transactionId, iniciar una nueva transacción
            if (!transactionId) {
                startTransaction();
            }

            // Ejecutar la función de envío con el ID de transacción actual
            const result = await submitFunction(transactionId);
            
            // Si  fue exitoso, completar la transacción
            completeTransaction();
            
            return result;
        } catch (error) {
            // En caso de error, limpiar la transacción
            clearTransaction();
            throw error;
        } finally {
            setIsSubmitting(false);
        }
    }, [isSubmitting, transactionId, startTransaction, completeTransaction, clearTransaction]);

    // El estado de envío combina tanto el envío del formulario como la carga de la transacción
    const isProcessing = isSubmitting || transactionLoading;
    
    return {
        isSubmitting: isProcessing,
        handleSubmit,
        transactionId
    };
};
