import express from 'express';
import cors from 'cors';
import path from 'path';
import authRoutes from './routes/auth.js';
import requestsRoutes from './routes/requests.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware - Allow all origins for production
app.use(cors({
    origin: true,
    credentials: true,
}));
app.use(express.json());

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Request logging middleware
app.use((req, _res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
    next();
});

// Health check
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/requests', requestsRoutes);

// 404 handler
app.use('/api/*', (_req, res) => {
    res.status(404).json({ error: 'Endpoint tidak ditemukan' });
});

// Start server
app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════╗
║     🏛️  Pelayanan Desa Tangkas - API Server            ║
╠════════════════════════════════════════════════════════╣
║  Server running at http://localhost:${PORT}              ║
║  Health check: http://localhost:${PORT}/api/health       ║
╚════════════════════════════════════════════════════════╝
  `);
});

export default app;
