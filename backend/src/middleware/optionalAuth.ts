import type { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import prisma from '../config/prisma';

export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const bearer = req.headers.authorization;
        
        if (!bearer) {
            req.user = undefined;
            return next();
        }

        const [, token] = bearer.split(' ');
        
        if (!token) {
            req.user = undefined;
            return next();
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;
        
        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: {
                id: true,
                email: true,
                name: true,
                lastname: true,
                role: true
            }
        });

        req.user = user || undefined;
        next();
        
    } catch (error) {
        req.user = undefined;
        next();
    }
};
