import { DateTime } from 'luxon'; 
import type { SalePaginationParams } from "../types";

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

// Construir cláusula de búsqueda para texto
const buildSearchClause = (search: string) => {
    return [
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
                brand: {
                    name: {
                        contains: search,
                        mode: 'insensitive'
                    }
                }
            }
        },
        {
            product: {
                category: {
                    name: {
                        contains: search,
                        mode: 'insensitive'
                    }
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
};

// Construir cláusula de fechas
const buildDateClause = (startDate?: Date, endDate?: Date) => {
    if (!startDate && !endDate) return null;

    const dateClause: any = {};

    if (startDate) {
        const startStr = typeof startDate === 'string' ? startDate : startDate.toISOString().split('T')[0];
        const startChile = DateTime.fromISO(startStr + 'T00:00:00', { zone: 'America/Santiago' });
        dateClause.gte = startChile.toUTC().toJSDate();
    }

    if (endDate) {
        const endStr = typeof endDate === 'string' ? endDate : endDate.toISOString().split('T')[0];
        const endChile = DateTime.fromISO(endStr + 'T23:59:59.999', { zone: 'America/Santiago' });
        dateClause.lte = endChile.toUTC().toJSDate();
    }

    return dateClause;
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

    if (search?.length > 0) {
        where.OR = buildSearchClause(search);
    }

    const dateClause = buildDateClause(startDate, endDate);
    if (dateClause) {
        where.createdAt = dateClause;
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

// Agregar URLs de imágenes a las ventas (ACTUALIZADO PARA CLOUDINARY)
export const addImageUrlsToSales = (sales: any[]) => {
    return sales.map(sale => ({
        ...sale,
        product: {
            ...sale.product,
            // Con Cloudinary, la imagen ya es una URL completa
            image: sale.product.image // Ya contiene la URL de Cloudinary o null
        }
    }));
};