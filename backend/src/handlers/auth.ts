import { Request, Response } from "express";
import prisma from "../config/prisma";
import { checkPassword, hashString } from "../utils/auth";
import { generateJWT } from "../utils/jwt";
import { generateEmailToken, sendVerificationEmail } from "../utils/emailToken";

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

        const passwordHashed = await hashString(password);
        const emailToken = await generateEmailToken();
        const emailTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

        const user = await prisma.user.create({
            data: {
                name,
                email: normalizedEmail,
                password: passwordHashed,
                lastname,
                role: "user",
                emailVerified: false,
                emailToken,
                emailTokenExpires
            },
        });

        try {
            await sendVerificationEmail(normalizedEmail, name, emailToken);
            return res.status(201).json({
                message: "Usuario registrado. Revisa tu email para verificar tu cuenta.",
                requiresVerification: true
            });
        } catch (emailError) {
            console.error("Error al enviar email:", emailError);
            // Si falla el email, eliminar el usuario creado
            await prisma.user.delete({ where: { id: user.id } });
            return res.status(500).json({ 
                error: "Error al enviar email de verificación. Intenta de nuevo." 
            });
        }

    } catch (error) {
        console.error("Error al Registrar Usuario:", error);
        return res.status(500).json({ error: "Error al Registrar Usuario" });
    }
};

export const verifyEmail = async (req: Request, res: Response) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ error: "Token requerido" });
        }

        const user = await prisma.user.findFirst({
            where: {
                emailToken: token,
                emailTokenExpires: {
                    gt: new Date() // Token no expirado
                }
            }
        });

        if (!user) {
            return res.status(400).json({ 
                error: "Token inválido o expirado" 
            });
        }

        // Verificar cuenta
        await prisma.user.update({
            where: { id: user.id },
            data: {
                emailVerified: true,
                emailToken: null,
                emailTokenExpires: null
            }
        });

        return res.status(200).json({
            message: "Email verificado exitosamente. Ya puedes iniciar sesión."
        });

    } catch (error) {
        console.error("Error al verificar email:", error);
        return res.status(500).json({ error: "Error al verificar email" });
    }
};

// Handler para reenviar email de verificación
export const resendVerificationEmail = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        const normalizedEmail = email.toLowerCase();

        const user = await prisma.user.findUnique({
            where: { email: normalizedEmail }
        });

        if (!user) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        if (user.emailVerified) {
            return res.status(400).json({ error: "El email ya está verificado" });
        }

        const emailToken = await generateEmailToken();
        const emailTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                emailToken,
                emailTokenExpires
            }
        });

        await sendVerificationEmail(normalizedEmail, user.name, emailToken);

        return res.status(200).json({
            message: "Email de verificación reenviado"
        });

    } catch (error) {
        console.error("Error al reenviar email:", error);
        return res.status(500).json({ error: "Error al reenviar email" });
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
        const token = generateJWT({ id: user.id });
        return res.status(200).json({ message: "Inicio de Sesión Exitoso", token: token });
    } catch (error) {
        console.error("Error al registrar usuario:", error);
        return res.status(500).json({ error: "Error al Registrar Usuario" });
    }
};

export const getUser = async (req: Request, res: Response) => {
    res.json(req.user);
};

// Obtener Todos los Usuarios
export const getUsersAdmins = async (req: Request, res: Response) => {
    try {
        const users = await prisma.user.findMany({
            where: {
                role: 'admin'
            },
            select: {
                id: true,
                name: true,
                lastname: true,
                email: true,
                role: true
            },
            orderBy: {
                name: 'asc'
            }
        });

        return res.status(200).json({
            users: users
        });

    } catch (error) {
        console.error("Error al obtener usuarios:", error);
        return res.status(500).json({
            error: "Error al obtener usuarios"
        });
    }
};