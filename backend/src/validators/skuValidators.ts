import prisma from "../config/prisma";
import type { SkuValidationResult } from "../types";

// Validar formato del SKU
export const validateSkuFormat = (sku?: string): SkuValidationResult => {
    if (!sku?.trim()) {
        return { isValid: false, error: "SKU no puede estar vacío" };
    }

    if (sku.trim().length > 50) {
        return { isValid: false, error: "El SKU no puede tener más de 50 caracteres" };
    }

    return { isValid: true };
};

// Validar unicidad del SKU
export const validateSkuUniqueness = async (sku: string, excludeId?: number): Promise<SkuValidationResult> => {
    const formatValidation = validateSkuFormat(sku);
    if (!formatValidation.isValid) {
        return formatValidation;
    }

    const where: any = { sku: sku.trim() };
    if (excludeId) {
        where.id = { not: excludeId };
    }

    const skuExists = await prisma.product.findFirst({ where });

    if (skuExists) {
        return { isValid: false, error: "El SKU ya está asociado a otro producto" };
    }

    return { isValid: true };
};