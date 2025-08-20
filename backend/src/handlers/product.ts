import { Request, Response } from "express";
import prisma from "../config/prisma";
import { ProductUpdateService } from "../services/ProductUpdateService";
import { cleanupFile } from "../utils/fileUtils";

// Importar helpers desde la carpeta correcta
import {
    validateProductInput,
    processProductCategory,
    createProductInDatabase,
    buildProductImageUrl,
    validateQueryParams,
    validateOrderByField,
    buildOrderByClause,
    buildPaginationResponse,
    buildProductSearchWhereByRole
} from "../helpers/productHelpers"; // ← CORREGIDO: desde ../helpers en lugar de ../productHelpers
import { sellAndRegisterSale } from "../services/productService";

const SERVER_URL = process.env.BACKEND_URL;

/* OBTENER PRODUCTOS - REFACTORIZADO CON HELPERS */
export const getProducts = async (req: Request, res: Response) => {
    try {
        // Validar y extraer parámetros de query
        const { page, limit, offset, orderBy, order, categoryId, search } = validateQueryParams(req.query);

        // Verificar si el usuario es admin
        const userRole = req.user?.role;

        //Obtener filtro isActive de query
        const explicitIsActive = req.query.isActive as string;

        // Validar categoryId si se proporciona
        if (req.query.categoryId && categoryId !== undefined && (isNaN(categoryId) || categoryId <= 0)) {
            return res.status(400).json({ error: "categoryId debe ser un número válido mayor a 0" });
        }

        // Validar campo de ordenamiento
        if (!validateOrderByField(orderBy)) {
            return res.status(400).json({
                error: 'Campo de ordenamiento inválido. Permitidos: name, price, stock, category'
            });
        }

        // Construir cláusulas de búsqueda y ordenamiento
        const where = buildProductSearchWhereByRole(categoryId, search, userRole, explicitIsActive);

        const orderByClause = buildOrderByClause(orderBy, order as 'asc' | 'desc');
        // Ejecutar consultas
        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                skip: offset,
                take: limit,
                include: {
                    category: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                },
                orderBy: orderByClause,
            }),
            prisma.product.count({ where }),
        ]);

        // Construir URLs de imágenes
        const productsWithImages = products.map(product => ({
            ...product,
            image: buildProductImageUrl(product.image, SERVER_URL)
        }));

        // Construir respuesta con paginación
        const paginationInfo = buildPaginationResponse(page, limit, total, categoryId, orderBy, order, search);

        return res.status(200).json({
            products: productsWithImages,
            ...paginationInfo
        });

    } catch (error: unknown) {
        console.error("Error al obtener productos:", error);
        return res.status(500).json({
            error: "Error al obtener productos"
        });
    }
};

/* CREAR PRODUCTO  */
export const createProduct = async (req: Request, res: Response) => {
    const { name, price, stock, sku, categoryId, categoryName, isActive } = req.body;
    const imageFile = req.file;

    try {
        let isActiveValue: boolean;

        if (isActive === undefined) {
            isActiveValue = true; // Valor por defecto
        } else if (typeof isActive === 'string') {
            isActiveValue = isActive === 'true';
        } else {
            isActiveValue = Boolean(isActive);
        }

        // 1. Validar entrada usando helper
        const inputValidation = await validateProductInput(name, price, stock, categoryId, categoryName, sku, isActiveValue);
        if (!inputValidation.success) {
            if (imageFile?.filename) {
                cleanupFile(imageFile.filename);
            }
            return res.status(inputValidation.statusCode).json({ error: inputValidation.error });
        }

        // 2. Procesar categoría usando helper
        const categoryResult = await processProductCategory(categoryId, categoryName);
        if (!categoryResult.success) {
            if (imageFile?.filename) {
                cleanupFile(imageFile.filename);
            }
            return res.status(categoryResult.statusCode).json({ error: categoryResult.error });
        }

        // 3. Crear producto en base de datos usando helper
        const newProduct = await createProductInDatabase(
            name,
            inputValidation.priceNum,
            inputValidation.stockNum,
            sku,
            imageFile,
            categoryResult.categoryData,
            isActiveValue
        );

        // 4. Respuesta exitosa con URL de imagen construida por helper
        return res.status(201).json({
            message: "Producto creado correctamente",
            product: {
                ...newProduct,
                image: buildProductImageUrl(newProduct.image, SERVER_URL)
            }
        });

    } catch (error) {
        // Limpiar archivo si hay error
        if (imageFile?.filename) {
            cleanupFile(imageFile.filename);
        }

        console.error("Error al crear producto:", error);
        return res.status(500).json({
            error: "Error al crear producto"
        });
    }
};

/* OBTENER PRODUCTO POR ID */
export const getProductById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const productId = parseInt(id);

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
            return res.status(404).json({ error: "Producto no encontrado" });
        }

        return res.status(200).json({
            product: {
                ...product,
                image: buildProductImageUrl(product.image, SERVER_URL)
            }
        });

    } catch (error) {
        console.error("Error al obtener producto:", error);
        return res.status(500).json({ error: "Error al obtener producto" });
    }
};

/* VENDER PRODUCTO  */
export const sellProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { quantity } = req.body;
        const productId = parseInt(id);
        const sellQuantity = parseInt(quantity);
        const userId = req.user?.id;

        if (isNaN(productId) || productId <= 0) {
            return res.status(400).json({ error: "ID de producto inválido" });
        }

        if (isNaN(sellQuantity) || sellQuantity <= 0) {
            return res.status(400).json({ error: "Cantidad de venta inválida" });
        }

        const result = await sellAndRegisterSale(productId, sellQuantity, userId);

       if (!result.success) {
            let statusCode = 400;
            if (result.error === "Producto no encontrado") {
                statusCode = 404;
            } else if (result.error === "Error interno al procesar la venta") {
                statusCode = 500;
            }

            return res.status(statusCode).json({ error: result.error });
        }

        if (!result.data) {
            return res.status(500).json({ error: "Error en los datos de la venta" });
        }

        return res.status(200).json({
            message: "Venta registrada correctamente",
            sale: result.data.sale,
            product: {
                ...result.data.product,
                previousStock: result.data.product.previousStock, 
                newStock: result.data.product.newStock
            }
        });
    } catch (error) {
        error.message = "Error al procesar la venta";
        return res.status(500).json({ error: error.message });
    }
};

/* ACTUALIZAR PRODUCTO COMPLETO */
export const updateProduct = async (req: Request, res: Response) => {
    const productUpdateService = new ProductUpdateService();
    try {
        const { id } = req.params;
        const { name, price, stock, sku, categoryId, categoryName, isActive } = req.body;
        const imageFile = req.file;
        const productId = parseInt(id);

        // Construir request dinámicamente
        const fieldsToUpdate = { name, price, stock, sku, categoryId, categoryName, isActive };

        // Filtrar solo campos que tienen valor (no undefined)
        const updateRequest: any = {
            id: productId,
            ...Object.fromEntries(
                Object.entries(fieldsToUpdate).filter(([_, value]) => value !== undefined)
            )
        };

        // Agregar imagen si existe
        if (imageFile) {
            updateRequest.imageFile = imageFile;
        }

        const result = await productUpdateService.updateProduct(updateRequest);

        if (!result.success) {
            return res.status(result.statusCode || 500).json({
                error: result.error
            });
        }

        return res.status(200).json({
            message: "Producto actualizado correctamente",
            product: result.product
        });

    } catch (error) {
        // Limpiar archivo si hay error
        if (req.file?.filename) {
            cleanupFile(req.file.filename);
        }

        console.error("Error al actualizar producto:", error);
        return res.status(500).json({ error: "Error al actualizar producto" });
    }
};

/* TOGGLE ESTADO DEL PRODUCTO */
export const toggleProductStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const productId = parseInt(id);

        // Verificar que el producto existe
        const existingProduct = await prisma.product.findUnique({
            where: { id: productId },
            select: {
                id: true,
                name: true,
                isActive: true
            }
        });

        if (!existingProduct) {
            return res.status(404).json({
                error: "Producto no encontrado"
            });
        }

        // Alternar el estado
        const newStatus = !existingProduct.isActive;

        const updatedProduct = await prisma.product.update({
            where: { id: productId },
            data: { isActive: newStatus },
            include: {
                category: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });

        return res.status(200).json({
            message: `Producto ${newStatus ? 'activado' : 'desactivado'} correctamente`,
            product: {
                ...updatedProduct,
                image: buildProductImageUrl(updatedProduct.image, SERVER_URL)
            }
        });

    } catch (error) {
        console.error("Error al cambiar estado del producto:", error);
        return res.status(500).json({
            error: "Error interno del servidor"
        });
    }
};