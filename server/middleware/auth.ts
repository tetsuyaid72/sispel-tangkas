import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../db/index.js';
import { adminUsers } from '../db/schema.js';
import { eq } from 'drizzle-orm';

const JWT_SECRET = process.env.JWT_SECRET || 'desa-tangkas-secret-key-change-in-production';

// Extend Express Request to include user info
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: number;
                username: string;
                name: string;
                role: string;
            };
        }
    }
}

export interface JwtPayload {
    userId: number;
    username: string;
}

// Middleware to verify JWT token
export const authMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'Token tidak ditemukan' });
            return;
        }

        const token = authHeader.split(' ')[1];

        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

        // Get user from database
        const user = await db
            .select()
            .from(adminUsers)
            .where(eq(adminUsers.id, decoded.userId))
            .get();

        if (!user) {
            res.status(401).json({ error: 'User tidak ditemukan' });
            return;
        }

        // Attach user to request
        req.user = {
            id: user.id,
            username: user.username,
            name: user.name,
            role: user.role,
        };

        next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            res.status(401).json({ error: 'Token tidak valid' });
            return;
        }
        res.status(500).json({ error: 'Server error' });
    }
};

// Helper to generate JWT token
export const generateToken = (userId: number, username: string): string => {
    return jwt.sign({ userId, username }, JWT_SECRET, { expiresIn: '24h' });
};

export { JWT_SECRET };
