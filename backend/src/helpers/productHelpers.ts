import prisma from "../config/prisma";
import { validateProductData } from "../validators";
import { validateSkuUniqueness } from "../validators/skuValidators";
import { handleCategoryById, handleCategoryByName } from "../services/productService";
import type { ProductValidationResult, CategoryProcessResult } from "../types";

// Validar entrada completa del producto
export const validateProductInput = async (
    name: string,
    price: number,
    stock: number,
    categoryId?: number,
    categoryName?: string,
    sku?: string,
    isActive?: boolean
): Promise<ProductValidationResult & { success: boolean; statusCode?: number }> => {
    // Validar datos del producto
    const validation = validateProductData(name, price, stock, categoryId, categoryName, isActive);
    if (!validation.isValid) {
        return { success: false, error: validation.error, statusCode: 400, isValid: false };
    }

    // Validar SKU único si se proporciona
    if (sku) {
        const skuValidation = await validateSkuUniqueness(sku);
        if (!skuValidation.isValid) {
            return { success: false, error: skuValidation.error, statusCode: 409, isValid: false };
        }
    }

    return {
        success: true,
        isValid: true,
        priceNum: validation.priceNum,
        stockNum: validation.stockNum
    };
};

// Procesar categoría (por ID o nombre)
export const processProductCategory = async (
    categoryId?: number,
    categoryName?: string
): Promise<CategoryProcessResult> => {
    let categoryResult;

    if (categoryId) {
        categoryResult = await handleCategoryById(categoryId);
    } else {
        categoryResult = await handleCategoryByName(categoryName);
    }

    if (!categoryResult.isValid) {
        return {
            success: false,
            error: categoryResult.error,
            statusCode: categoryId ? 404 : 400
        };
    }

    return { success: true, categoryData: categoryResult.categoryData };
};

// Crear producto en la base de datos
export const createProductInDatabase = async (
    name: string,
    priceNum: number,
    stockNum: number,
    sku: string | undefined,
    imageFile: Express.Multer.File | undefined,
    categoryData: any,
    isActive: boolean = true
) => {
    return await prisma.product.create({
        data: {
            name: name.trim(),
            price: priceNum,
            stock: stockNum,
            sku: sku?.trim() || null,
            image: imageFile?.filename || null,
            isActive,
            category: categoryData
        },
        include: {
            category: {
                select: {
                    id: true,
                    name: true
                }
            }
        }
    });
};

// Construir URL completa de imagen de producto
export const buildProductImageUrl = (imageName: string | null, serverUrl: string): string | null => {
    return imageName ? `${serverUrl}/uploads/products/${imageName}` : null;
};

// Validar parámetros de query para getProducts
export const validateQueryParams = (query: any) => {
    const page = Math.max(1, parseInt(query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit as string) || 10));
    const offset = (page - 1) * limit;
    const orderBy = (query.orderBy as string) || 'name';
    const order = (query.order as string) === 'desc' ? 'desc' : 'asc';
    const categoryId = query.categoryId ? parseInt(query.categoryId as string) : undefined;
    const search = query.search as string;

    return { page, limit, offset, orderBy, order, categoryId, search };
};

// Validar campos permitidos para ordenamiento
export const validateOrderByField = (orderBy: string): boolean => {
    const allowedFields = ['name', 'price', 'stock', 'category'];
    return allowedFields.includes(orderBy);
};

// Construir cláusula WHERE para búsqueda de productos
export const buildProductSearchWhere = (categoryId?: number, search?: string, isActive?: boolean) => {
    const where: {
        categoryId?: number;
        isActive?: boolean;
        OR?: Array<{
            name?: { contains: string; mode: 'insensitive' };
            sku?: { contains: string; mode: 'insensitive' };
            category?: {
                name: { contains: string; mode: 'insensitive' };
            };
        }>;
    } = {};

    if (categoryId !== undefined && !isNaN(categoryId)) {
        where.categoryId = categoryId;
    }

    if (isActive !== undefined) {
        where.isActive = isActive;
    }

    if (search?.trim()) {
        where.OR = [
            {
                name: {
                    contains: search.trim(),
                    mode: 'insensitive'
                }
            },
            {
                sku: {
                    contains: search.trim(),
                    mode: 'insensitive'
                }
            },
            {
                category: {
                    name: {
                        contains: search.trim(),
                        mode: 'insensitive'
                    }
                }
            }
        ];
    }

    return where;
};
//Helper específico para construir WHERE según rol de usuario
export const buildProductSearchWhereByRole = (
    categoryId?: number,
    search?: string,
    userRole?: string
) => {
    const isAdmin = userRole === 'admin';
    const where = buildProductSearchWhere(categoryId, search);

    // Si no es admin, solo mostrar productos activos
    if (!isAdmin) {
        where.isActive = true;
    }

    return where;
};
// CORREGIDO: Construir cláusula ORDER BY con tipos correctos de Prisma
export const buildOrderByClause = (orderBy: string, order: 'asc' | 'desc') => {
    if (orderBy === 'category') {
        return {
            category: {
                name: order
            }
        };
    }

    return {
        [orderBy]: order
    };
};

// Construir respuesta de paginación
export const buildPaginationResponse = (
    page: number,
    limit: number,
    total: number,
    categoryId?: number,
    orderBy?: string,
    order?: string,
    search?: string
) => {
    const totalPages = Math.ceil(total / limit);

    return {
        pagination: {
            currentPage: page,
            totalPages,
            totalItems: total,
            itemsPerPage: limit,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
        },
        filters: {
            categoryId: categoryId || null,
            orderBy,
            order,
            search: search || null
        }
    };
};

// Verificar stock suficiente para venta
export const validateStockForSale = (currentStock: number, requestedQuantity: number): boolean => {
    return currentStock >= requestedQuantity;
};

// Construir respuesta de venta exitosa
export const buildSaleResponse = (
    sellQuantity: number,
    updatedProduct: any,
    previousStock: number,
    serverUrl: string
) => {
    return {
        message: `Venta realizada. ${sellQuantity} unidad(es) vendida(s)`,
        product: {
            ...updatedProduct,
            image: buildProductImageUrl(updatedProduct.image, serverUrl)
        },
        sale: {
            quantity: sellQuantity,
            previousStock: previousStock,
            newStock: updatedProduct.stock
        }
    };
};
// Helper para parsear valores boolean de form-data
export const parseBoolean = (value: unknown, defaultValue: boolean = false): boolean => {
    if (value === undefined || value === null) {
        return defaultValue;
    }
    
    if (typeof value === 'string') {
        return value.toLowerCase() === 'true';
    }
    
    return Boolean(value);
};

// Helper específico para isActive con default true
export const parseIsActive = (isActive: unknown): boolean => {
    return parseBoolean(isActive, true);
};