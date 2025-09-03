import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';

const prisma = new PrismaClient();

export const checkTransactionExists = async (transactionId: string) => {
  const existingTransaction = await prisma.processedTransaction.findUnique({
    where: { id: transactionId }
  });
  return existingTransaction;
};

export const saveTransaction = async (
  transactionId: string,
  type: 'create' | 'update',
  entityType: string,
  entityId: number,
  responseData: any
) => {
  await prisma.processedTransaction.create({
    data: {
      id: transactionId,
      type,
      entityType,
      entityId,
      responseData
    }
  });
};

export const handleIdempotentRequest = async (
  req: Request,
  res: Response,
  operation: () => Promise<any>,
  type: 'create' | 'update',
  entityType: string
) => {
  const { transactionId } = req.body;

  if (!transactionId) {
    return operation();
  }

  try {
    const existingTransaction = await checkTransactionExists(transactionId);

    if (existingTransaction) {
      return res.json(existingTransaction.responseData);
    }

    const result = await operation();
    
    await saveTransaction(
      transactionId,
      type,
      entityType,
      result.id,
      result
    );

    return res.json(result);
  } catch (error) {
    console.error('Error in idempotent request:', error);
    throw error;
  }
};
