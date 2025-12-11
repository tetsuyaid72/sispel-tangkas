import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { db } from '../db/index.js';
import { serviceRequests, requestStatusHistory, RequestStatus } from '../db/schema.js';
import { eq, desc, like, or, sql, count } from 'drizzle-orm';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Create uploads directory if not exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        // Accept images and PDFs
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Tipe file tidak didukung. Gunakan JPG, PNG, GIF, WEBP, atau PDF.'));
        }
    }
});

// Generate unique tracking number
const generateTrackingNumber = (): string => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `TGK${year}${month}${day}${random}`;
};

// POST /api/requests - Create new service request with file uploads (public)
router.post('/', upload.array('documents', 10), async (req: Request, res: Response): Promise<void> => {
    try {
        const {
            serviceId,
            serviceTitle,
            applicantName,
            applicantPhone,
            applicantAddress,
            applicantNik,
            notes,
            requirementLabels, // Array of requirement labels corresponding to uploaded files
        } = req.body;

        // Get uploaded files
        const files = req.files as Express.Multer.File[];

        // Validation
        if (!serviceId || !serviceTitle || !applicantName || !applicantPhone) {
            res.status(400).json({
                error: 'Data tidak lengkap',
                required: ['serviceId', 'serviceTitle', 'applicantName', 'applicantPhone'],
            });
            return;
        }

        const trackingNumber = generateTrackingNumber();
        const now = new Date().toISOString();

        // Build documents array with file info
        let documentsData: { label: string; filename?: string; path?: string }[] = [];
        if (requirementLabels) {
            const labels = typeof requirementLabels === 'string'
                ? JSON.parse(requirementLabels)
                : requirementLabels;

            labels.forEach((label: string, index: number) => {
                const file = files?.[index];
                documentsData.push({
                    label,
                    filename: file?.originalname,
                    path: file?.filename,
                });
            });
        }

        // Insert new request
        const result = await db
            .insert(serviceRequests)
            .values({
                trackingNumber,
                serviceId,
                serviceTitle,
                applicantName,
                applicantPhone,
                applicantAddress: applicantAddress || null,
                applicantNik: applicantNik || null,
                notes: notes || null,
                documents: JSON.stringify(documentsData),
                status: 'pending',
                createdAt: now,
                updatedAt: now,
            })
            .returning();

        const newRequest = result[0];

        // Add initial status history
        await db.insert(requestStatusHistory).values({
            requestId: newRequest.id,
            previousStatus: null,
            newStatus: 'pending',
            notes: 'Pengajuan baru diterima',
            changedAt: now,
        });

        res.status(201).json({
            message: 'Pengajuan berhasil dikirim',
            trackingNumber,
            request: newRequest,
        });
    } catch (error: any) {
        console.error('Create request error:', error);
        if (error.code === 'LIMIT_FILE_SIZE') {
            res.status(400).json({ error: 'Ukuran file melebihi batas 5MB' });
            return;
        }
        res.status(500).json({ error: 'Terjadi kesalahan server' });
    }
});

// GET /api/requests/track/:trackingNumber - Track request status (public)
router.get('/track/:trackingNumber', async (req: Request, res: Response): Promise<void> => {
    try {
        const { trackingNumber } = req.params;

        const request = await db
            .select()
            .from(serviceRequests)
            .where(eq(serviceRequests.trackingNumber, trackingNumber))
            .get();

        if (!request) {
            res.status(404).json({ error: 'Pengajuan tidak ditemukan' });
            return;
        }

        // Get status history
        const history = await db
            .select()
            .from(requestStatusHistory)
            .where(eq(requestStatusHistory.requestId, request.id))
            .orderBy(desc(requestStatusHistory.changedAt))
            .all();

        res.json({
            request: {
                trackingNumber: request.trackingNumber,
                serviceTitle: request.serviceTitle,
                applicantName: request.applicantName,
                status: request.status,
                createdAt: request.createdAt,
                updatedAt: request.updatedAt,
                completedAt: request.completedAt,
            },
            history,
        });
    } catch (error) {
        console.error('Track request error:', error);
        res.status(500).json({ error: 'Terjadi kesalahan server' });
    }
});

// ============== ADMIN ROUTES (Protected) ==============

// GET /api/requests - List all requests (admin only)
router.get('/', authMiddleware, async (req: Request, res: Response): Promise<void> => {
    try {
        const { status, search, page = '1', limit = '10' } = req.query;
        const pageNum = parseInt(page as string, 10);
        const limitNum = parseInt(limit as string, 10);
        const offset = (pageNum - 1) * limitNum;

        // Build query conditions
        let query = db.select().from(serviceRequests);

        // Filter by status
        if (status && status !== 'all') {
            query = query.where(eq(serviceRequests.status, status as RequestStatus)) as typeof query;
        }

        // Search by name, phone, or tracking number
        if (search) {
            const searchTerm = `%${search}%`;
            query = query.where(
                or(
                    like(serviceRequests.applicantName, searchTerm),
                    like(serviceRequests.applicantPhone, searchTerm),
                    like(serviceRequests.trackingNumber, searchTerm)
                )
            ) as typeof query;
        }

        // Get total count
        const totalResult = await db
            .select({ count: count() })
            .from(serviceRequests)
            .get();

        const total = totalResult?.count || 0;

        // Get paginated results
        const requests = await query
            .orderBy(desc(serviceRequests.createdAt))
            .limit(limitNum)
            .offset(offset)
            .all();

        res.json({
            requests,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum),
            },
        });
    } catch (error) {
        console.error('List requests error:', error);
        res.status(500).json({ error: 'Terjadi kesalahan server' });
    }
});

// GET /api/requests/stats - Get dashboard statistics (admin only)
router.get('/stats', authMiddleware, async (_req: Request, res: Response): Promise<void> => {
    try {
        const pending = await db
            .select({ count: count() })
            .from(serviceRequests)
            .where(eq(serviceRequests.status, 'pending'))
            .get();

        const processing = await db
            .select({ count: count() })
            .from(serviceRequests)
            .where(eq(serviceRequests.status, 'processing'))
            .get();

        const completed = await db
            .select({ count: count() })
            .from(serviceRequests)
            .where(eq(serviceRequests.status, 'completed'))
            .get();

        const rejected = await db
            .select({ count: count() })
            .from(serviceRequests)
            .where(eq(serviceRequests.status, 'rejected'))
            .get();

        const total = await db
            .select({ count: count() })
            .from(serviceRequests)
            .get();

        res.json({
            pending: pending?.count || 0,
            processing: processing?.count || 0,
            completed: completed?.count || 0,
            rejected: rejected?.count || 0,
            total: total?.count || 0,
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ error: 'Terjadi kesalahan server' });
    }
});

// GET /api/requests/:id - Get single request detail (admin only)
router.get('/:id', authMiddleware, async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const request = await db
            .select()
            .from(serviceRequests)
            .where(eq(serviceRequests.id, parseInt(id, 10)))
            .get();

        if (!request) {
            res.status(404).json({ error: 'Pengajuan tidak ditemukan' });
            return;
        }

        // Get status history
        const history = await db
            .select()
            .from(requestStatusHistory)
            .where(eq(requestStatusHistory.requestId, request.id))
            .orderBy(desc(requestStatusHistory.changedAt))
            .all();

        res.json({ request, history });
    } catch (error) {
        console.error('Get request error:', error);
        res.status(500).json({ error: 'Terjadi kesalahan server' });
    }
});

// PATCH /api/requests/:id/status - Update request status (admin only)
router.patch('/:id/status', authMiddleware, async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { status, notes } = req.body;

        if (!status || !['pending', 'processing', 'completed', 'rejected'].includes(status)) {
            res.status(400).json({ error: 'Status tidak valid' });
            return;
        }

        const existingRequest = await db
            .select()
            .from(serviceRequests)
            .where(eq(serviceRequests.id, parseInt(id, 10)))
            .get();

        if (!existingRequest) {
            res.status(404).json({ error: 'Pengajuan tidak ditemukan' });
            return;
        }

        const now = new Date().toISOString();
        const updateData: Record<string, unknown> = {
            status,
            adminNotes: notes || existingRequest.adminNotes,
            updatedAt: now,
        };

        // Set completedAt if status is completed or rejected
        if (status === 'completed' || status === 'rejected') {
            updateData.completedAt = now;
        }

        // Update request
        await db
            .update(serviceRequests)
            .set(updateData)
            .where(eq(serviceRequests.id, parseInt(id, 10)));

        // Add status history
        await db.insert(requestStatusHistory).values({
            requestId: existingRequest.id,
            previousStatus: existingRequest.status,
            newStatus: status,
            notes,
            changedBy: req.user?.id || null,
            changedAt: now,
        });

        res.json({
            message: 'Status berhasil diperbarui',
            request: { ...existingRequest, status, updatedAt: now },
        });
    } catch (error) {
        console.error('Update status error:', error);
        res.status(500).json({ error: 'Terjadi kesalahan server' });
    }
});

// DELETE /api/requests/:id - Delete request (admin only)
router.delete('/:id', authMiddleware, async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const existingRequest = await db
            .select()
            .from(serviceRequests)
            .where(eq(serviceRequests.id, parseInt(id, 10)))
            .get();

        if (!existingRequest) {
            res.status(404).json({ error: 'Pengajuan tidak ditemukan' });
            return;
        }

        await db
            .delete(serviceRequests)
            .where(eq(serviceRequests.id, parseInt(id, 10)));

        res.json({ message: 'Pengajuan berhasil dihapus' });
    } catch (error) {
        console.error('Delete request error:', error);
        res.status(500).json({ error: 'Terjadi kesalahan server' });
    }
});

export default router;
