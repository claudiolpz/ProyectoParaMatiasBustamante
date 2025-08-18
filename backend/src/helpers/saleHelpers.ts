import { buildProductImageUrl } from "./productHelpers";
import type {SalePaginationParams} from "../types";
// Validar parámetros de query para ventas
export const validateSaleQueryParams = (query: any) => {
    const page = parseInt(query.page as string) || 1;
    const limit = Math.min(parseInt(query.limit as string) || 10, 100);
    const offset = (page - 1) * limit;

    const userId = query.userId ? parseInt(query.userId as string) : undefined;
    const productId = query.productId ? parseInt(query.productId as string) : undefined;
    const categoryId = query.categoryId ? parseInt(query.categoryId as string) : undefined; 

    //Busqueda por texto
    const search = query.search ? query.search.toString().trim() : undefined;

    // Fechas de filtro
    const startDate = query.startDate ? new Date(query.startDate as string) : undefined;
    const endDate = query.endDate ? new Date(query.endDate as string) : undefined;
    
    // Ordenamiento
    const orderBy = query.orderBy as string || 'createdAt';
    const order = query.order as string || 'desc';

    return {
        page,
        limit,
        offset,
        userId,
        productId,
        categoryId,
        search,
        startDate,
        endDate,
        orderBy,
        order
    };
};

// Validar campo de ordenamiento para ventas
export const validateSaleOrderByField = (orderBy: string): boolean => {
    const validFields = ['createdAt', 'totalPrice', 'quantity', 'unitPrice'];
    return validFields.includes(orderBy);
};

// Construir cláusula WHERE para búsqueda de ventas
export const buildSaleSearchWhere = (
    userId?: number,
    productId?: number,
    categoryId?: number,
    search?: string,
    startDate?: Date,
    endDate?: Date
) => {
    const where: any = {};

    if (userId) {
        where.userId = userId;
    }

    if (productId) {
        where.productId = productId;
    }

    if (categoryId) {
        where.product = {
            categoryId: categoryId
        };
    }

    if (search && search.length > 0) {
        where.OR = [
            {
                product: {
                    name: {
                        contains: search,
                        mode: 'insensitive'
                    }
                }
            },
            {
                product: {
                    sku: {
                        contains: search,
                        mode: 'insensitive'
                    }
                }
            },
            {
                user: {
                    name: {
                        contains: search,
                        mode: 'insensitive'
                    }
                }
            },
            {
                user: {
                    lastname: {
                        contains: search,
                        mode: 'insensitive'
                    }
                }
            }
        ];
    }

    if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) {
            where.createdAt.gte = startDate;
        }
        if (endDate) {
            where.createdAt.lte = endDate;
        }
    }

    return where;
};

// Construir cláusula de ordenamiento para ventas
export const buildSaleOrderByClause = (orderBy: string, order: 'asc' | 'desc') => {
    const orderByMap: { [key: string]: any } = {
        'createdAt': { createdAt: order },
        'totalPrice': { totalPrice: order },
        'quantity': { quantity: order },
        'unitPrice': { unitPrice: order }
    };

    return orderByMap[orderBy] || { createdAt: 'desc' };
};

// Construir respuesta de paginación para ventas
export const buildSalePaginationResponse = (params: SalePaginationParams) => {
    return {
        pagination: {
            currentPage: params.page,
            itemsPerPage: params.limit,
            totalItems: params.total,
            totalPages: Math.ceil(params.total / params.limit),
            hasNextPage: params.page < Math.ceil(params.total / params.limit),
            hasPrevPage: params.page > 1
        },
        filters: {
            userId: params.userId,
            productId: params.productId,
            categoryId: params.categoryId,
            search: params.search,
            startDate: params.startDate,
            endDate: params.endDate,
            orderBy: params.orderBy,
            order: params.order
        }
    };
};

// Agregar URLs de imágenes a las ventas
export const addImageUrlsToSales = (sales: any[], serverUrl: string | undefined) => {
    return sales.map(sale => ({
        ...sale,
        product: {
            ...sale.product,
            image: buildProductImageUrl(sale.product.image, serverUrl)
        }
    }));
};