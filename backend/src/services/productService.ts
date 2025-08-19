import prisma from "../config/prisma";
import { validateSkuUniqueness } from "../validators";

// Función para manejar categoría por ID
export const handleCategoryById = async (categoryId: number) => {
    const categoryIdNum = Number(categoryId);

    if (isNaN(categoryIdNum) || categoryIdNum <= 0) {
        return { isValid: false, error: "categoryId debe ser un número válido mayor a 0" };
    }

    const existingCategory = await prisma.category.findUnique({
        where: { id: categoryIdNum }
    });

    if (!existingCategory) {
        return { isValid: false, error: "La categoría especificada no existe" };
    }

    return {
        isValid: true,
        categoryData: { connect: { id: existingCategory.id } }
    };
};

// Función para manejar categoría por nombre
export const handleCategoryByName = async (categoryName: string) => {
    const trimmedCategoryName = categoryName.trim();

    if (!trimmedCategoryName || trimmedCategoryName.length < 2) {
        return {
            isValid: false,
            error: "Nombre de categoría inválido. Debe tener al menos 2 caracteres"
        };
    }

    const existingCategory = await prisma.category.findFirst({
        where: {
            name: {
                equals: trimmedCategoryName,
                mode: "insensitive"
            }
        }
    });

    const categoryData = existingCategory
        ? { connect: { id: existingCategory.id } }
        : { create: { name: trimmedCategoryName } };

    return { isValid: true, categoryData };
};

export const sellAndRegisterSale = async (
    productId: number,
    quantity: number,
    userId: number
) => {
    try {
        // 1. Verificar que el producto existe y está activo
        const product = await prisma.product.findUnique({
            where: { id: productId },
            include: {
                category: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });

        if (!product) {
            return {
                success: false,
                error: "Producto no encontrado"
            };
        }

        if (!product.isActive) {
            return {
                success: false,
                error: "No se puede vender un producto inactivo"
            };
        }

        // 2. Verificar stock suficiente
        if (product.stock < quantity) {
            return {
                success: false,
                error: `Stock insuficiente. Stock disponible: ${product.stock}, cantidad solicitada: ${quantity}`
            };
        }

        // 3. Realizar la transacción: actualizar stock y registrar venta
        const result = await prisma.$transaction(async (tx) => {
            // Actualizar stock del producto
            const updatedProduct = await tx.product.update({
                where: { id: productId },
                data: {
                    stock: product.stock - quantity
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

            // Crear registro de venta
            const sale = await tx.sale.create({
                data: {
                    userId: userId,
                    productId: productId,
                    quantity: quantity,
                    unitPrice: product.price,
                    totalPrice: product.price * quantity,
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            lastname: true,
                            email: true
                        }
                    },
                    product: {
                        select: {
                            id: true,
                            name: true,
                            sku: true
                        }
                    }
                }
            });

            return { updatedProduct, sale };
        });

        // 4. Retornar resultado exitoso
        return {
            success: true,
            data: {
                sale: {
                    id: result.sale.id,
                    quantity: quantity,
                    unitPrice: result.sale.unitPrice,
                    totalPrice: result.sale.totalPrice,
                    createdAt: result.sale.createdAt,
                    user: result.sale.user,
                    product: result.sale.product
                },
                product: {
                    ...result.updatedProduct,
                    previousStock: product.stock,
                    newStock: result.updatedProduct.stock
                }
            }
        };

    } catch (error) {
        console.error("Error en sellAndRegisterSale:", error);
        return {
            success: false,
            error: "Error interno al procesar la venta"
        };
    }
};


// Re-exportar validador de SKU para compatibilidad
export const validateSKU = validateSkuUniqueness;

