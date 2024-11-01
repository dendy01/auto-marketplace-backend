import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import { initialize } from './config/database';
import authRoutes from './routes/auth';
import carsRoutes from './routes/cars';
import userRoutes from './routes/users';
import path from 'path';
import { pool } from './config/database';

const AuthService = {
    getToken: () => {
        return null;
    }
};

dotenv.config();

axios.interceptors.request.use((config: any) => {
    const token = AuthService.getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

const app = express();
const PORT = 3001;

app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.get('/api/cars/popular', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT c.*, u.name as owner_name, u.phone as owner_phone 
            FROM cars c 
            JOIN users u ON c.user_id = u.id 
            ORDER BY c.views DESC
            LIMIT 4
        `);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/cars', carsRoutes);
app.use('/api/users', userRoutes);
const uploadsPath = path.join(__dirname, '..', 'uploads');
app.use('/uploads', express.static(uploadsPath));
console.log('Uploads directory path:', uploadsPath);

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

app.get('/', (req, res) => {
    res.json({ 
        message: 'Auto Marketplace API is running',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            cars: '/api/cars',
            users: '/api/users'
        }
    });
});

export default app;
