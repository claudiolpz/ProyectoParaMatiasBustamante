import { buildProductImageUrl } from "./productHelpers";

// Validar parámetros de query para ventas
export const validateSaleQueryParams = (query: any) => {
    const page = parseInt(query.page as string) || 1;
    const limit = Math.min(parseInt(query.limit as string) || 10, 100);
    const offset = (page - 1) * limit;

    const userId = query.userId ? parseInt(query.userId as string) : undefined;
    const productId = query.productId ? parseInt(query.productId as string) : undefined;
    
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
export const buildSalePaginationResponse = (
    page: number,
    limit: number,
    total: number,
    userId?: number,
    productId?: number,
    orderBy?: string,
    order?: string,
    startDate?: Date,
    endDate?: Date
) => {
    return {
        pagination: {
            currentPage: page,
            itemsPerPage: limit,
            totalItems: total,
            totalPages: Math.ceil(total / limit),
            hasNextPage: page < Math.ceil(total / limit),
            hasPrevPage: page > 1
        },
        filters: {
            userId,
            productId,
            startDate,
            endDate,
            orderBy,
            order
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