import type { CategoryValidationResult } from "../types";

// Validar ID de categoría
export const validateCategoryId = (categoryId?: string | number): CategoryValidationResult => {
    if (categoryId === undefined || categoryId === null) {
        return { isValid: true };
    }
    
    const categoryIdNum = typeof categoryId === 'string' ? parseInt(categoryId) : categoryId;
    if (isNaN(categoryIdNum) || categoryIdNum <= 0) {
        return { 
            isValid: false, 
            error: "categoryId debe ser un número válido mayor a 0" 
        };
    }
    
    return { isValid: true };
};

// Validar nombre de categoría
export const validateCategoryName = (categoryName?: string): CategoryValidationResult => {
    if (categoryName !== undefined && (!categoryName?.trim() || categoryName.trim().length < 2)) {
        return { 
            isValid: false, 
            error: "El nombre de la categoría debe tener al menos 2 caracteres" 
        };
    }
    return { isValid: true };
};