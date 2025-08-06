import { Request, Response } from "express";
import prisma from "../config/prisma";
import { cleanupFile, handleCategoryById, handleCategoryByName, validateProductData, validateSKU } from "../services/productService";

const SERVER_URL = process.env.URL_BACKEND || process.env.URL_BACKEND_LOCAL;

export const getProducts = async (req: Request, res: Response) => {
    try {
        const page = Math.max(1, parseInt(req.query.page as string) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));
        const offset = (page - 1) * limit;

        const orderBy = (req.query.orderBy as string) || 'name';
        const order = (req.query.order as string) === 'desc' ? 'desc' : 'asc';
        const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined;
        const search = req.query.search as string;

        // Validar categoryId si se proporciona
        if (req.query.categoryId && categoryId !== undefined && (isNaN(categoryId) || categoryId <= 0)) {
            return res.status(400).json({ error: "categoryId debe ser un número válido mayor a 0" });
        }

        // MODIFICADO: Agregar 'category' a los campos permitidos
        const allowedFields = ['name', 'price', 'stock', 'category'];

        if (!allowedFields.includes(orderBy)) {
            return res.status(400).json({
                error: 'Campo de ordenamiento inválido. Permitidos: name, price, stock, category'
            });
        }

        const where: {
            categoryId?: number;
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

        // MODIFICADO: Construir orderBy dinámicamente para manejar 'category'
        let orderByClause: any;
        
        if (orderBy === 'category') {
            // Ordenar por el nombre de la categoría
            orderByClause = {
                category: {
                    name: order
                }
            };
        } else {
            // Ordenamiento normal para otros campos
            orderByClause = {
                [orderBy]: order
            };
        }

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
                orderBy: orderByClause, // ← USAR orderByClause dinámico
            }),
            prisma.product.count({ where }),
        ]);

        // Construir URL completa de la imagen
        const productsWithImages = products.map(product => ({
            ...product,
            image: product.image ? `${SERVER_URL}/uploads/products/${product.image}` : null
        }));

        const totalPages = Math.ceil(total / limit);
        return res.status(200).json({
            products: productsWithImages,
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
        });

    } catch (error: unknown) {
        console.error("Error al obtener productos:", error);
        return res.status(500).json({
            error: "Error al obtener productos"
        });
    }
};
export const createProduct = async (req: Request, res: Response) => {
    try {
        const { name, price, stock, sku, categoryId, categoryName } = req.body;
        const imageFile = req.file;

        // Validar datos del producto
        const validation = validateProductData(name, price, stock, categoryId, categoryName);
        if (!validation.isValid) {
            return res.status(400).json({ error: validation.error });
        }

        const { priceNum, stockNum } = validation;

        // Validar SKU único si se proporciona
        if (sku) {
            const skuValidation = await validateSKU(sku);
            if (!skuValidation.isValid) {
                return res.status(409).json({ error: skuValidation.error });
            }
        }

        // Manejar categoría
        let categoryResult;
        if (categoryId) {
            categoryResult = await handleCategoryById(categoryId);
        } else {
            categoryResult = await handleCategoryByName(categoryName);
        }

        if (!categoryResult.isValid) {
            return res.status(categoryId ? 404 : 400).json({ error: categoryResult.error });
        }

        // Crear producto
        const newProduct = await prisma.product.create({
            data: {
                name: name.trim(),
                price: priceNum,
                stock: stockNum,
                sku: sku?.trim() || null,
                image: imageFile?.filename || null,
                category: categoryResult.categoryData
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

        return res.status(201).json({
            message: "Producto creado correctamente",
            product: {
                ...newProduct,
                image: newProduct.image ? `${SERVER_URL}/uploads/products/${newProduct.image}` : null
            }
        });

    } catch (error) {
        if (req.file?.filename) {
            cleanupFile(req.file.filename);
        }

        console.error("Error al crear producto:", error);
        return res.status(500).json({
            error: "Error al crear producto"
        });
    }
};