import type { PartialProductData, ProductValidationResult } from "../types";

export const validateProductName = (name?: string): ProductValidationResult => {
    if (name !== undefined && (!name?.trim())) {
        return { isValid: false, error: "El nombre del producto no puede estar vacío" };
    }
    return { isValid: true };
};

export const validateProductPrice = (price?: number | string): ProductValidationResult => {
    if (price === undefined) {
        return { isValid: true, priceNum: undefined };
    }
    
    const priceNum = parseInt(price.toString());
    if (isNaN(priceNum) || priceNum <= 0) {
        return { 
            isValid: false, 
            error: "El precio debe ser un número entero mayor a 0 (pesos chilenos)" 
        };
    }
    
    return { isValid: true, priceNum };
};

export const validateProductStock = (stock?: number | string): ProductValidationResult => {
    if (stock === undefined) {
        return { isValid: true, stockNum: undefined };
    }
    
    const stockNum = parseInt(stock.toString());
    if (isNaN(stockNum) || stockNum < 0) {
        return { 
            isValid: false, 
            error: "El stock debe ser un número entero mayor o igual a 0" 
        };
    }
    
    return { isValid: true, stockNum };
};

// Validar isActive
const validateProductIsActive = (isActive?: boolean | string): ProductValidationResult => {
    if (isActive === undefined) {
        return { isValid: true };
    }
    
    // Convertir string a boolean si es necesario
    if (typeof isActive === 'string') {
        if (isActive === 'true' || isActive === 'false') {
            return { isValid: true };
        }
        return { 
            isValid: false, 
            error: "isActive debe ser true o false" 
        };
    }
    
    if (typeof isActive !== 'boolean') {
        return { 
            isValid: false, 
            error: "isActive debe ser un valor booleano" 
        };
    }
    
    return { isValid: true };
};

export const validateAtLeastOneField = (data: PartialProductData): ProductValidationResult => {
    const { name, price, stock, categoryId, categoryName, isActive } = data;
    
    if (name === undefined && price === undefined && stock === undefined && 
        categoryId === undefined && categoryName === undefined && isActive === undefined) {
        return { 
            isValid: false, 
            error: "Debe proporcionar al menos un campo para actualizar" 
        };
    }
    
    return { isValid: true };
};

// Validación completa para creación de producto
export const validateProductData = (
    name: string, 
    price: number, 
    stock: number, 
    categoryId?: number, 
    categoryName?: string,
    isActive?: boolean
): ProductValidationResult => {
    if (!name || price == null || stock == null || (!categoryId && !categoryName)) {
        return { isValid: false, error: "Faltan campos obligatorios" };
    }

    const priceValidation = validateProductPrice(price);
    if (!priceValidation.isValid) {
        return priceValidation;
    }

    const stockValidation = validateProductStock(stock);
    if (!stockValidation.isValid) {
        return stockValidation;
    }

    // Validar isActive si se proporciona
    const isActiveValidation = validateProductIsActive(isActive);
    if (!isActiveValidation.isValid) {
        return isActiveValidation;
    }

    return { 
        isValid: true, 
        priceNum: priceValidation.priceNum, 
        stockNum: stockValidation.stockNum 
    };
};

// Validación parcial para actualización de producto
export const validatePartialProductData = (data: PartialProductData): ProductValidationResult => {
    const atLeastOneFieldValidation = validateAtLeastOneField(data);
    if (!atLeastOneFieldValidation.isValid) {
        return atLeastOneFieldValidation;
    }

    const nameValidation = validateProductName(data.name);
    if (!nameValidation.isValid) {
        return nameValidation;
    }

    const priceValidation = validateProductPrice(data.price);
    if (!priceValidation.isValid) {
        return priceValidation;
    }

    const stockValidation = validateProductStock(data.stock);
    if (!stockValidation.isValid) {
        return stockValidation;
    }

    // NUEVO: Validar isActive
    const isActiveValidation = validateProductIsActive(data.isActive);
    if (!isActiveValidation.isValid) {
        return isActiveValidation;
    }

    return { 
        isValid: true, 
        priceNum: priceValidation.priceNum, 
        stockNum: stockValidation.stockNum 
    };
};