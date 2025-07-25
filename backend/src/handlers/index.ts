import { Request, Response } from "express";
import { validationResult } from "express-validator";
import prisma from "../config/prisma";
import { hashPassword } from "../utils/auth";

export const createAccount = async (req: Request, res: Response) => {
    // Manejar errores de validación
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { name, email, password, lastname } = req.body;
        const userExists = await prisma.user.findUnique({
            where: {
                email: email,
            },
        });

        if (userExists) {
            const error = new Error("El correo electrónico ya está en uso");
            res.status(409).json({ error: error.message });
            return;
        }

        const passwordHashed = await hashPassword(password);
        await prisma.user.create({
            data: {
                name,
                email,
                password: passwordHashed,
                lastname,
            },
        });

        res.status(201).json("Usuario registrado correctamente");
    } catch (error) {
        console.error("Error al registrar usuario:", error);
        res.status(500).json({ error: "Error al registrar usuario" });
    }
};
