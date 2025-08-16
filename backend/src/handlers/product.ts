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
    buildProductSearchWhere,
    buildOrderByClause,
    buildPaginationResponse,
    validateStockForSale,
    buildSaleResponse
} from "../helpers/productHelpers"; // ← CORREGIDO: desde ../helpers en lugar de ../productHelpers

const SERVER_URL = process.env.URL_BACKEND || process.env.URL_BACKEND_LOCAL;

/* OBTENER PRODUCTOS - REFACTORIZADO CON HELPERS */
export const getProducts = async (req: Request, res: Response) => {
    try {
        // Validar y extraer parámetros de query
        const { page, limit, offset, orderBy, order, categoryId, search } = validateQueryParams(req.query);

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
        const where = buildProductSearchWhere(categoryId, search);
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

/* CREAR PRODUCTO - VERSIÓN FINAL CON HELPERS */
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

/* VENDER PRODUCTO - REFACTORIZADO */
export const sellProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { quantity } = req.body;
        const productId = parseInt(id);
        const sellQuantity = parseInt(quantity);

        // Verificar si el producto existe
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

        // Verificar stock suficiente usando helper
        if (!validateStockForSale(product.stock, sellQuantity)) {
            return res.status(400).json({ 
                error: `Stock insuficiente. Stock actual: ${product.stock}, cantidad solicitada: ${sellQuantity}` 
            });
        }

        // Actualizar stock
        const updatedProduct = await prisma.product.update({
            where: { id: productId },
            data: {
                stock: product.stock - sellQuantity
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

        // Construir respuesta usando helper
        const saleResponse = buildSaleResponse(sellQuantity, updatedProduct, product.stock, SERVER_URL);
        return res.status(200).json(saleResponse);

    } catch (error) {
        console.error("Error al vender producto:", error);
        return res.status(500).json({ error: "Error al procesar la venta" });
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

/* Activar PRODUCTO */
export const activateProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const productId = parseInt(id);

        // 1. Verificar que el producto existe
        const existingProduct = await prisma.product.findUnique({
            where: { id: productId }
        });

        if (!existingProduct) {
            return res.status(404).json({ 
                error: "Producto no encontrado" 
            });
        }
        if(existingProduct.isActive) {
            return res.status(400).json({
                error: "El Producto ya está activado"
            });
        }

        // 3. Activar producto de la base de datos
        const ActivateProduct = await prisma.product.update({
            where: { id: productId },
            data: { isActive: true }
        });

         return res.status(200).json({
            message: "Producto activado correctamente",
            product: {
                id: ActivateProduct.id,
                name: ActivateProduct.name,
                isActive: ActivateProduct.isActive
            }
        });

    } catch (error: any) {
        console.error("Error al activar producto:", error);
        
        // Manejar error de restricción de clave foránea
        if (error.code === 'P2003') {
            return res.status(400).json({ 
                error: "Error al activar el producto" 
            });
        }

        return res.status(500).json({ 
            error: "Error interno al activar producto" 
        });
    }
};

/* Desactivar PRODUCTO */
export const deactivateProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const productId = parseInt(id);

        // 1. Verificar que el producto existe
        const existingProduct = await prisma.product.findUnique({
            where: { id: productId }
        });

        if (!existingProduct) {
            return res.status(404).json({ 
                error: "Producto no encontrado" 
            });
        }
        if(!existingProduct.isActive) {
            return res.status(400).json({
                error: "El Producto ya está activado"
            });
        }

        // 3. Desactivar producto de la base de datos
        const DeactivateProduct = await prisma.product.update({
            where: { id: productId },
            data: { isActive: false }
        });

         return res.status(200).json({
            message: "Producto desactivado correctamente",
            product: {
                id: DeactivateProduct.id,
                name: DeactivateProduct.name,
                isActive: DeactivateProduct.isActive
            }
        });

    } catch (error: any) {
        console.error("Error al desactivar producto:", error);
        
        // Manejar error de restricción de clave foránea
        if (error.code === 'P2003') {
            return res.status(400).json({ 
                error: "Error al desactivar el producto" 
            });
        }

        return res.status(500).json({ 
            error: "Error interno al desactivar producto" 
        });
    }
};