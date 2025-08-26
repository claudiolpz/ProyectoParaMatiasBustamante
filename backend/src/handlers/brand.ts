import { Request, Response } from "express";
import { validationResult } from "express-validator";
import prisma from "../config/prisma";

export const getBrands = async (req: Request, res: Response) => {
    try {
        const brands = await prisma.brand.findMany({
            select: {
                id: true,
                name: true
            },
            orderBy: {
                name: 'asc'
            }
        });

        return res.status(200).json({
            brands
        });
    } catch (error) {
        console.error("Error al obtener marcas:", error);
        return res.status(500).json({
            error: "Error al obtener marcas"
        });
    }
};

export const createBrand = async (req: Request, res: Response) => {
    try {
        // Verificar errores de validación
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: "Datos inválidos",
                details: errors.array()
            });
        }

        const { name } = req.body;

        // Verificar si la marca ya existe
        const existingBrand = await prisma.brand.findUnique({
            where: { name: name.trim() }
        });

        if (existingBrand) {
            return res.status(400).json({
                error: "Ya existe una marca con ese nombre"
            });
        }

        // Crear la nueva marca
        const brand = await prisma.brand.create({
            data: {
                name: name.trim()
            },
            select: {
                id: true,
                name: true
            }
        });

        return res.status(201).json({
            message: "Marca creada exitosamente",
            brand
        });
    } catch (error) {
        console.error("Error al crear marca:", error);
        return res.status(500).json({
            error: "Error al crear marca"
        });
    }
};

export const updateBrand = async (req: Request, res: Response) => {
    try {
        // Verificar errores de validación
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: "Datos inválidos",
                details: errors.array()
            });
        }

        const { id } = req.params;
        const { name } = req.body;

        // Verificar si la marca existe
        const existingBrand = await prisma.brand.findUnique({
            where: { id: parseInt(id) }
        });

        if (!existingBrand) {
            return res.status(404).json({
                error: "Marca no encontrada"
            });
        }

        // Si se está actualizando el nombre, verificar que no exista otro con el mismo nombre
        if (name && name.trim() !== existingBrand.name) {
            const brandWithSameName = await prisma.brand.findUnique({
                where: { name: name.trim() }
            });

            if (brandWithSameName) {
                return res.status(400).json({
                    error: "Ya existe una marca con ese nombre"
                });
            }
        }

        // Actualizar la marca
        const updatedBrand = await prisma.brand.update({
            where: { id: parseInt(id) },
            data: {
                ...(name && { name: name.trim() })
            },
            select: {
                id: true,
                name: true
            }
        });

        return res.status(200).json({
            message: "Marca actualizada exitosamente",
            brand: updatedBrand
        });
    } catch (error) {
        console.error("Error al actualizar marca:", error);
        return res.status(500).json({
            error: "Error al actualizar marca"
        });
    }
};

export const deleteBrand = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Verificar si la marca existe
        const existingBrand = await prisma.brand.findUnique({
            where: { id: parseInt(id) }
        });

        if (!existingBrand) {
            return res.status(404).json({
                error: "Marca no encontrada"
            });
        }

        // Verificar si hay productos usando esta marca
        const productsWithBrand = await prisma.product.findMany({
            where: { brandId: parseInt(id) }
        });

        if (productsWithBrand.length > 0) {
            return res.status(400).json({
                error: "No se puede eliminar la marca porque tiene productos asociados"
            });
        }

        // Eliminar la marca
        await prisma.brand.delete({
            where: { id: parseInt(id) }
        });

        return res.status(200).json({
            message: "Marca eliminada exitosamente"
        });
    } catch (error) {
        console.error("Error al eliminar marca:", error);
        return res.status(500).json({
            error: "Error al eliminar marca"
        });
    }
};
