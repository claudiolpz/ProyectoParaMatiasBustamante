import { Request, Response } from "express";
import prisma from "../config/prisma";
import { checkPassword, hashPassword } from "../utils/auth";

export const createAccount = async (req: Request, res: Response) => {
    try {
        const { name, email, password, lastname } = req.body;
        const normalizedEmail = email.toLowerCase();
        const userExists = await prisma.user.findUnique({
            where: {
                email: normalizedEmail,
            },
        });

        if (userExists) {
            const error = new Error("El Email ya está asociado a otra cuenta");
            res.status(409).json({ error: error.message });
            return;
        }

        const passwordHashed = await hashPassword(password);
        await prisma.user.create({
            data: {
                name,
                email: normalizedEmail,
                password: passwordHashed,
                lastname,
            },
        });

        res.status(201).json("Usuario Registrado Correctamente");
    } catch (error) {
        console.error("Error al Registrar Usuario:", error);
        res.status(500).json({ error: "Error al Registrar Usuario" });
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
            const error = new Error("Contraseña Incorrecta o Email no Incorrecto");
            res.status(404).json({ error: error.message });
            return;
        }
        const isPasswordCorrect = await checkPassword(password, user.password);
        if (!isPasswordCorrect) {
            const error = new Error("Contraseña Incorrecta o Email no Incorrecto");
            res.status(401).json({ error: error.message });
            return;
        }
        res
            .status(200)
            .json({ message: "Inicio de Sesión Exitoso", userId: user.id });
    } catch (error) {
        console.error("Error al registrar usuario:", error);
        res.status(500).json({ error: "Error al Registrar Usuario" });
    }
};
