import type { BrandValidationResult } from "../types";

// Validar formato de la marca
const validateBrandFormat = (brand?: string): BrandValidationResult => {
    if (!brand?.trim()) {
        return { isValid: false, error: "La marca no puede estar vacía" };
    }

    if (brand.trim().length > 50) {
        return { isValid: false, error: "La marca no puede tener más de 50 caracteres" };
    }

    return { isValid: true };
};

// Validar marca (solo formato, no unicidad)
export const validateBrand = async (brand: string): Promise<BrandValidationResult> => {
    return validateBrandFormat(brand);
};
