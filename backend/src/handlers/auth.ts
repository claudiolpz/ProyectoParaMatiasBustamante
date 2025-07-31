import { Request, Response } from "express";
import prisma from "../config/prisma";
import { checkPassword, hashPassword } from "../utils/auth";
import { generateJWT } from "../utils/jwt";

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
                role: "user"
            },
        });

        return res.status(201).json("Usuario Registrado Correctamente");
    } catch (error) {
        console.error("Error al Registrar Usuario:", error);
        return res.status(500).json({ error: "Error al Registrar Usuario" });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const normalizedEmail = email.toLowerCase();
        const user = await prisma.user.findUnique({
            where: {
                email: normalizedEmail,
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
        const token = generateJWT({id: user.id, role: user.role});
        return res.status(200).json({ message: "Inicio de Sesión Exitoso", token:token});
    } catch (error) {
        console.error("Error al registrar usuario:", error);
        return res.status(500).json({ error: "Error al Registrar Usuario" });
    }
};
