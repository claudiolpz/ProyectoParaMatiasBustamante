import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma';

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: number;
                name: string;
                lastname: string;
                role: string;
                email: string;
            };
        }
    }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    const bearer= req.headers.authorization;
    if(!bearer){
        const error = new Error("No Autorizado");
        return res.status(401).json({ error: error.message });
    }
    const [, token] = bearer.split(" ");
    
    if(!token){
        const error = new Error("No Autorizado");
        return res.status(401).json({ error: error.message });
    }

    try{
        const result = jwt.verify(token, process.env.JWT_SECRET)
        if(typeof result === 'object' && result.id){
            const user = await prisma.user.findUnique({
                select:{
                    id: true,
                    name: true,
                    lastname: true,
                    role: true,
                    email: true,
                },
                where: {
                    id: result.id
                }
            });
            if(!user){
                return res.status(404).json({ error: "Usuario no encontrado" });
            }
            req.user = user;
            next();
        }
    }catch(error){
        error.message = "Token no válido";
        res.status(500).json({ error: error.message });
    }
}

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
        return res.status(401).json({ 
            error: "No autorizado. Debe iniciar sesión primero." 
        });
    }

    // SOLO verifica si es admin
    if (req.user.role !== 'admin') {
        return res.status(403).json({ 
            error: "Acceso denegado. Se requieren permisos de administrador." 
        });
    }

    next();
};