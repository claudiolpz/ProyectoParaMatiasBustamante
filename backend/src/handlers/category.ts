import { Request, Response } from "express";
import prisma from "../config/prisma";

export const getCategories = async (req: Request, res: Response) => {
    try {
        const categories = await prisma.category.findMany({
            select: {
                id: true,
                name: true
            },
            orderBy: {
                name: 'asc'
            }
        });

        return res.status(200).json({
            categories
        });
    } catch (error) {
        console.error("Error al obtener categorías:", error);
        return res.status(500).json({
            error: "Error al obtener categorías"
        });
    }
};