import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import { initialize } from './config/database';
import authRoutes from './routes/auth';
import carsRoutes from './routes/cars';
import userRoutes from './routes/users';
import path from 'path';

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
    origin: ['http://localhost:8080', 'http://localhost:8081'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

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

export default app;
