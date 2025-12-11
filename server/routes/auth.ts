import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db/index.js';
import { adminUsers } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { authMiddleware, generateToken } from '../middleware/auth.js';

const router = Router();

// POST /api/auth/login - Admin login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            res.status(400).json({ error: 'Username dan password harus diisi' });
            return;
        }

        // Find user by username
        const user = await db
            .select()
            .from(adminUsers)
            .where(eq(adminUsers.username, username))
            .get();

        if (!user) {
            res.status(401).json({ error: 'Username atau password salah' });
            return;
        }

        // Verify password
        const isValidPassword = bcrypt.compareSync(password, user.passwordHash);

        if (!isValidPassword) {
            res.status(401).json({ error: 'Username atau password salah' });
            return;
        }

        // Update last login time
        await db
            .update(adminUsers)
            .set({ lastLoginAt: new Date().toISOString() })
            .where(eq(adminUsers.id, user.id));

        // Generate JWT token
        const token = generateToken(user.id, user.username);

        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                name: user.name,
                role: user.role,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Terjadi kesalahan server' });
    }
});

// GET /api/auth/me - Get current user info
router.get('/me', authMiddleware, async (req: Request, res: Response): Promise<void> => {
    res.json({ user: req.user });
});

// POST /api/auth/logout - Logout (client-side token removal)
router.post('/logout', (_req: Request, res: Response): void => {
    // JWT is stateless, so logout is handled client-side by removing the token
    res.json({ message: 'Logout berhasil' });
});

export default router;
