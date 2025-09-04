import prisma from "../config/prisma";
import { validateProductData } from "../validators";
import { handleCategoryById, handleCategoryByName, handleBrandById, handleBrandByName } from "../services/productService";
import type { ProductValidationResult, CategoryProcessResult, BrandProcessResult } from "../types";

// Validar entrada completa del producto
export const validateProductInput = async (
    name: string,
    price: number,
    stock: number,
    categoryId?: number,
    categoryName?: string,
    brandId?: number,
    isActive?: boolean
): Promise<ProductValidationResult & { success: boolean; statusCode?: number }> => {
    // Validar datos del producto
    const validation = validateProductData(name, price, stock, categoryId, categoryName, isActive);
    if (!validation.isValid) {
        return { success: false, error: validation.error, statusCode: 400, isValid: false };
    }

    // Validar que la marca existe si se proporciona brandId
    if (brandId !== undefined && brandId !== null) {
        const brand = await prisma.brand.findUnique({
            where: { id: brandId }
        });

        if (!brand) {
            return { success: false, error: "La marca especificada no existe", statusCode: 400, isValid: false };
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
    } else if (categoryName) {
        categoryResult = await handleCategoryByName(categoryName);
    } else {
        return {
            success: false,
            error: "Se requiere una categoría (ID o nombre)",
            statusCode: 400
        };
    }

    if (!categoryResult.isValid) {
        return {
            success: false,
            error: categoryResult.error,
            statusCode: categoryId ? 404 : 400
        };
    }

    // Asegurarse de que tenemos un ID válido
    if (categoryResult.categoryData?.connect?.id) {
        const categoryData = await prisma.category.findUnique({
            where: { id: categoryResult.categoryData.connect.id }
        });

        if (!categoryData) {
            return {
                success: false,
                error: "No se pudo encontrar la categoría",
                statusCode: 404
            };
        }

        return { success: true, categoryData };
    }
    // Si es una categoría nueva a crear
    else if (categoryResult.categoryData?.create) {
        const newCategory = await prisma.category.create({
            data: { name: categoryResult.categoryData.create.name }
        });
        return { success: true, categoryData: newCategory };
    }
    // Si no hay datos válidos
    else {
        return {
            success: false,
            error: "Datos de categoría no válidos",
            statusCode: 400
        };
    }
};
// Procesar marca (por ID o nombre)
export const processProductBrand = async (
    brandId?: number,
    brandName?: string
): Promise<BrandProcessResult> => {
    let brandResult;

    if (brandId) {
        brandResult = await handleBrandById(brandId);
    } else if (brandName) {
        brandResult = await handleBrandByName(brandName);
    } else {
        // Si no se proporciona brandId ni brandName, es válido (marca opcional)
        return { success: true, brandData: null };
    }

    if (!brandResult.isValid) {
        return {
            success: false,
            error: brandResult.error,
            statusCode: brandId ? 404 : 400
        };
    }

    // Si tenemos una marca válida, obtener sus datos completos
    if (brandResult.brandData?.connect?.id) {
        const brandData = await prisma.brand.findUnique({
            where: { id: brandResult.brandData.connect.id }
        });

        if (brandData) {
            return { success: true, brandData };
        }
    } else if (brandResult.brandData?.create) {
        // Si es una marca nueva, crearla primero
        const newBrand = await prisma.brand.create({
            data: { name: brandResult.brandData.create.name }
        });
        return { success: true, brandData: newBrand };
    }

    return { success: true, brandData: brandResult.brandData };
};

// Crear producto en la base de datos
export const createProductInDatabase = async (
    name: string,
    priceNum: number,
    stockNum: number,
    brandData: any,
    imageFile: Express.Multer.File | undefined,
    categoryData: any,
    isActive: boolean = true
) => {
    if (!categoryData?.id) {
        throw new Error('La categoría es obligatoria');
    }

    const createData: any = {
        name: name.trim(),
        price: priceNum,
        stock: stockNum,
        image: (imageFile as any)?.path || null,
        isActive,
        category: {
            connect: { id: categoryData.id }
        }
    };

    // Manejar la marca
    if (brandData) {
        createData.brand = {
            connect: { id: brandData.id }
        };
    }

    return await prisma.product.create({
        data: createData,
        include: {
            category: {
                select: {
                    id: true,
                    name: true
                }
            },
            brand: {
                select: {
                    id: true,
                    name: true
                }
            }
        }
    });
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
    const allowedFields = ['name', 'price', 'stock', 'category', 'brand'];
    return allowedFields.includes(orderBy);
};

// Construir cláusula WHERE para búsqueda de productos
const buildProductSearchWhere = (categoryId?: number, search?: string, isActive?: boolean) => {
    const where: any = {};

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
                brand: {
                    name: {
                        contains: search.trim(),
                        mode: 'insensitive'
                    }
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
    userRole?: string,
    explicitIsActive?: string
) => {
    const isAdmin = userRole === 'admin';
    const where = buildProductSearchWhere(categoryId, search);

    // Si no es admin, solo mostrar productos activos
    if (isAdmin && explicitIsActive !== undefined) {
        if (explicitIsActive === 'true') {
            where.isActive = true;
        } else if (explicitIsActive === 'false') {
            where.isActive = false;
        }
        // Si es 'all' o undefined, no agregar filtro isActive
    } else if (!isAdmin) {
        // Si no es admin, solo mostrar productos activos
        where.isActive = true;
    }

    return where;
};
// Construir cláusula ORDER BY con tipos correctos de Prisma
export const buildOrderByClause = (orderBy: string, order: 'asc' | 'desc') => {
    if (orderBy === 'category') {
        return {
            category: {
                name: order
            }
        };
    }

    if (orderBy === 'brand') {
        return {
            brand: {
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

// Procesar los datos de entrada para la creación de producto
export const processProductCreationData = (data: {
    isActive?: unknown;
    brandId?: string | number;
    categoryId?: string | number;
    price: string | number;
}) => {
    let isActiveValue: boolean;

    if (data.isActive === undefined) {
        isActiveValue = true;
    } else if (typeof data.isActive === 'string') {
        isActiveValue = data.isActive === 'true';
    } else {
        isActiveValue = Boolean(data.isActive);
    }

    const brandIdNum = typeof data.brandId === 'string' ? parseInt(data.brandId) : data.brandId;
    const categoryIdNum = typeof data.categoryId === 'string' ? parseInt(data.categoryId) : data.categoryId;
    const priceStr = typeof data.price === 'string' ? data.price.replace(/\./g, '') : data.price.toString();
    const processedPrice = Number(priceStr);

    return {
        isActiveValue,
        brandIdNum,
        categoryIdNum,
        processedPrice
    };
};

// Procesar los datos de entrada para la actualización de producto
export const processProductUpdateData = (data: {
    name?: string;
    price?: string | number;
    stock?: string | number;
    brandId?: string | number;
    brandName?: string | number;
    categoryId?: string | number;
    categoryName?: string;
    isActive?: unknown;
    id: string | number;
}): Record<string, any> => {
    const productId = typeof data.id === 'string' ? parseInt(data.id) : data.id;

    let processedPrice;
    if (data.price) {
        processedPrice = typeof data.price === 'string' ?
            data.price.replace(/\./g, '') :
            data.price;
    }

    let processedBrandId;
    if (data.brandId) {
        processedBrandId = typeof data.brandId === 'string' ?
            parseInt(data.brandId) :
            data.brandId;
    }

    let processedCategoryId;
    if (data.categoryId) {
        processedCategoryId = typeof data.categoryId === 'string' ?
            parseInt(data.categoryId) :
            data.categoryId;
    }

    // Construir request dinámicamente solo con campos definidos
    const fieldsToUpdate = {
        name: data.name,
        price: processedPrice,
        stock: data.stock,
        brandId: processedBrandId,
        brandName: data.brandName,
        categoryId: processedCategoryId,
        categoryName: data.categoryName,
        isActive: data.isActive !== undefined ? parseBoolean(data.isActive) : undefined
    };

    // Filtrar solo campos que tienen valor (no undefined)
    const updateRequest = {
        id: productId,
        ...Object.fromEntries(
            Object.entries(fieldsToUpdate).filter(([_, value]) => value !== undefined)
        )
    };

    return updateRequest;
};

// Helper para parsear valores boolean de form-data
const parseBoolean = (value: unknown, defaultValue: boolean = false): boolean => {
    if (value === undefined || value === null) {
        return defaultValue;
    }

    if (typeof value === 'string') {
        return value.toLowerCase() === 'true';
    }

    return Boolean(value);
};
