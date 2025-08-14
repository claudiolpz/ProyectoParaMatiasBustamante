import type { PartialProductData, ProductValidationResult } from "../types";

export const validateProductName = (name?: string): ProductValidationResult => {
    if (name !== undefined && (!name?.trim())) {
        return { isValid: false, error: "El nombre del producto no puede estar vacío" };
    }
    return { isValid: true };
};

// Validar precio en pesos chilenos (enteros)
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

// Validar stock del producto
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

// Validar que al menos un campo esté presente para actualización
export const validateAtLeastOneField = (data: PartialProductData): ProductValidationResult => {
    const { name, price, stock, categoryId, categoryName } = data;
    
    if (name === undefined && price === undefined && stock === undefined && 
        categoryId === undefined && categoryName === undefined) {
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
    categoryName?: string
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

    return { 
        isValid: true, 
        priceNum: priceValidation.priceNum, 
        stockNum: stockValidation.stockNum 
    };
};

// Validación parcial para actualización de producto
export const validatePartialProductData = (data: PartialProductData): ProductValidationResult => {
    // Verificar que al menos un campo esté presente
    const atLeastOneFieldValidation = validateAtLeastOneField(data);
    if (!atLeastOneFieldValidation.isValid) {
        return atLeastOneFieldValidation;
    }

    // Validar name
    const nameValidation = validateProductName(data.name);
    if (!nameValidation.isValid) {
        return nameValidation;
    }

    // Validar price
    const priceValidation = validateProductPrice(data.price);
    if (!priceValidation.isValid) {
        return priceValidation;
    }

    // Validar stock
    const stockValidation = validateProductStock(data.stock);
    if (!stockValidation.isValid) {
        return stockValidation;
    }

    return { 
        isValid: true, 
        priceNum: priceValidation.priceNum, 
        stockNum: stockValidation.stockNum 
    };
};