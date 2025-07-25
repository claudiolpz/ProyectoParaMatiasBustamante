import { Request, Response } from "express";
import { validationResult } from "express-validator";
import prisma from "../config/prisma";
import { checkPassword, hashPassword } from "../utils/auth";

export const createAccount = async (req: Request, res: Response) => {
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

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const user = await prisma.user.findUnique({
            where: {
                email: email,
            },
        });

        if (!user) {
            const error = new Error("El usuario no existe");
            res.status(404).json({ error: error.message });
            return;
        }
        const isPasswordCorrect = await checkPassword(password, user.password);
        if (!isPasswordCorrect) {
            const error = new Error("Contraseña incorrecta");
            res.status(401).json({ error: error.message });
            return;
        }
        res
            .status(200)
            .json({ message: "Inicio de sesión exitoso", userId: user.id });
    } catch (error) {
        console.error("Error al registrar usuario:", error);
        res.status(500).json({ error: "Error al registrar usuario" });
    }
};
