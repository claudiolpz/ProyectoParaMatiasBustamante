import { useState, useEffect } from 'react';
import type { UseTransactionResult } from '../types';

export const useTransaction = (type: 'create' | 'update'): UseTransactionResult => {
  const [transactionId, setTransactionId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Recuperar transactionId del localStorage si existe
    const storedId = localStorage.getItem(`${type}TransactionId`);
    if (storedId) {
      setTransactionId(storedId);
      // No activamos isLoading aquí, solo cuando se inicia una nueva transacción
    }
  }, [type]);

  const startTransaction = () => {
    const newId = crypto.randomUUID();
    setTransactionId(newId);
    setIsLoading(true);
    localStorage.setItem(`${type}TransactionId`, newId);
  };

  const completeTransaction = () => {
    clearTransaction();
  };

  const clearTransaction = () => {
    localStorage.removeItem(`${type}TransactionId`);
    setTransactionId('');
    setIsLoading(false);
  };

  return {
    transactionId,
    isLoading,
    startTransaction,
    completeTransaction,
    clearTransaction
  };
};
