export interface UpdateProductRequest {
    id: number;
    name?: string;        // ← Opcional
    price?: number;       // ← Opcional
    stock?: number;       // ← Opcional
    sku?: string;
    categoryId?: number;
    categoryName?: string;
    imageFile?: Express.Multer.File;
    isActive?: boolean;
}

export interface UpdateProductResult {
    success: boolean;
    product?: any;
    error?: string;
    statusCode?: number;
}

export interface CreateProductRequest {
    name: string;
    price: number;
    stock: number;
    sku?: string;
    categoryId?: number;
    categoryName?: string;
    imageFile?: Express.Multer.File;
    isActive?: boolean; // ← Por defecto será true
}

export interface ValidationSuccessResult extends UpdateProductResult {
    success: true;
    validatedData: {
        priceNum?: number;
        stockNum?: number;
    };
}

export interface ValidationErrorResult extends UpdateProductResult {
    success: false;
    error: string;
    statusCode: number;
}

export interface CategorySuccessResult extends UpdateProductResult {
    success: true;
    categoryData?: any;
}

export interface CategoryErrorResult extends UpdateProductResult {
    success: false;
    error: string;
    statusCode: number;
}

export interface ProductValidationResult {
    isValid: boolean;
    error?: string;
    priceNum?: number;
    stockNum?: number;
}

export interface PartialProductData {
    name?: string;
    price?: number | string;
    stock?: number | string;
    categoryId?: string | number;
    categoryName?: string;
    isActive?: boolean;
}

export interface CategoryValidationResult {
    isValid: boolean;
    error?: string;
}

export interface SkuValidationResult {
    isValid: boolean;
    error?: string;
}

export interface CategoryProcessResult {
    success: boolean;
    error?: string;
    statusCode?: number;
    categoryData?: any;
}
export interface CategoryProcessResult {
    success: boolean;
    error?: string;
    statusCode?: number;
    categoryData?: any;
}