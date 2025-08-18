import { Request, Response } from "express";
import prisma from "../config/prisma";
import {
    validateSaleQueryParams,
    validateSaleOrderByField,
    buildSaleSearchWhere,
    buildSaleOrderByClause,
    buildSalePaginationResponse,
    addImageUrlsToSales
} from "../helpers/saleHelpers";

const SERVER_URL = process.env.URL_BACKEND || process.env.URL_BACKEND_LOCAL;

/* OBTENER VENTAS - CON FILTROS Y PAGINACIÓN */
export const getSales = async (req: Request, res: Response) => {
    try {
        // Validar y extraer parámetros de query
        const {
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
        } = validateSaleQueryParams(req.query);

        // Validaciones adicionales
        if (req.query.userId && userId !== undefined && (isNaN(userId) || userId <= 0)) {
            return res.status(400).json({ error: "userId debe ser un número válido mayor a 0" });
        }

        if (req.query.productId && productId !== undefined && (isNaN(productId) || productId <= 0)) {
            return res.status(400).json({ error: "productId debe ser un número válido mayor a 0" });
        }

        // Validación de categoryId
        if (req.query.categoryId && categoryId !== undefined && (isNaN(categoryId) || categoryId <= 0)) {
            return res.status(400).json({ error: "categoryId debe ser un número válido mayor a 0" });
        }

        // Validación de search
        if (req.query.search && search !== undefined && search.length < 1) {
            return res.status(400).json({ error: "La búsqueda debe tener al menos 1 carácter" });
        }

        // Validar fechas
        if (startDate && isNaN(startDate.getTime())) {
            return res.status(400).json({ error: "startDate debe ser una fecha válida" });
        }

        if (endDate && isNaN(endDate.getTime())) {
            return res.status(400).json({ error: "endDate debe ser una fecha válida" });
        }

        // Validar campo de ordenamiento
        if (!validateSaleOrderByField(orderBy)) {
            return res.status(400).json({
                error: 'Campo de ordenamiento inválido. Permitidos: createdAt, totalPrice, quantity, unitPrice'
            });
        }

        // Construir cláusulas de búsqueda y ordenamiento
        const where = buildSaleSearchWhere(userId, productId, categoryId, search, startDate, endDate);
        const orderByClause = buildSaleOrderByClause(orderBy, order as 'asc' | 'desc');


        // Ejecutar consultas
        const [sales, total] = await Promise.all([
            prisma.sale.findMany({
                where,
                skip: offset,
                take: limit,
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
                            sku: true,
                            image: true,
                            price: true,
                            category: {
                                select: {
                                    id: true,
                                    name: true
                                }
                            }
                        }
                    }
                },
                orderBy: orderByClause
            }),
            prisma.sale.count({ where })
        ]);

        // Agregar URLs de imágenes
        const salesWithImages = addImageUrlsToSales(sales, SERVER_URL);

        // Construir respuesta con paginación
        const paginationInfo = buildSalePaginationResponse({
            page,
            limit,
            total,
            userId,
            productId,
            categoryId,
            search,
            orderBy,
            order,
            startDate,
            endDate
        });

        return res.status(200).json({
            sales: salesWithImages,
            ...paginationInfo
        });

    } catch (error: unknown) {
        console.error("Error al obtener ventas:", error);
        return res.status(500).json({
            error: "Error al obtener ventas"
        });
    }
};

/* OBTENER VENTA POR ID */
export const getSaleById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const saleId = parseInt(id);

        if (isNaN(saleId) || saleId <= 0) {
            return res.status(400).json({ error: "ID de venta inválido" });
        }

        const sale = await prisma.sale.findUnique({
            where: { id: saleId },
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
                        sku: true,
                        image: true,
                        price: true,
                        category: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    }
                }
            }
        });

        if (!sale) {
            return res.status(404).json({ error: "Venta no encontrada" });
        }

        // Agregar URL de imagen
        const saleWithImage = addImageUrlsToSales([sale], SERVER_URL)[0];

        return res.status(200).json({
            sale: saleWithImage
        });

    } catch (error) {
        console.error("Error al obtener venta:", error);
        return res.status(500).json({ error: "Error al obtener venta" });
    }
};