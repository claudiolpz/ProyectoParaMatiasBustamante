export interface UpdateProductRequest {
    id: number;
    name?: string;       
    price?: number;      
    stock?: number;       
    brandId?: number;
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

export interface SkuValidationResult {
    isValid: boolean;
    error?: string;
}

export interface BrandValidationResult {
    isValid: boolean;
    error?: string;
}

export interface CategoryProcessResult {
    success: boolean;
    error?: string;
    statusCode?: number;
    categoryData?: any;
}

export interface BrandProcessResult {
    success: boolean;
    error?: string;
    statusCode?: number;
    brandData?: any;
}

export interface SalePaginationParams {
    page: number;
    limit: number;
    total: number;
    userId?: number;
    productId?: number;
    categoryId?: number;
    search?: string;
    orderBy?: string;
    order?: string;
    startDate?: Date;
    endDate?: Date;
}

export interface Brand {
    id: number;
    name: string;
}

export interface BrandCreateRequest {
    name: string;
}

export interface BrandUpdateRequest {
    name?: string;
}