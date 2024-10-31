import { Router, Request, Response } from 'express';
import { pool } from '../config/database';

interface AuthRequest extends Request {
    user: {
        id: number;
        email: string;
        role: string;
    }
}

export const getAllCars = async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`
            SELECT c.*, u.name as owner_name, u.phone as owner_phone 
            FROM cars c 
            JOIN users u ON c.user_id = u.id 
            ORDER BY c.created_at DESC
        `);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const getCarById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await pool.query(`
            SELECT c.*, u.name as owner_name, u.phone as owner_phone 
            FROM cars c 
            JOIN users u ON c.user_id = u.id 
            WHERE c.id = $1
        `, [id]);

        if (!result.rows.length) {
            return res.status(404).json({ message: 'Car not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const createCar = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.id;
        
        // Destructure the request body
        const { 
            brand, 
            model, 
            year, 
            price, 
            description, 
            mileage, 
            transmission, 
            bodyType, 
            fuelType, 
            engineVolume, 
            power 
        } = req.body;
        
        // Handle multiple files
        const uploadedFiles = req.files as Express.Multer.File[];
        const images = uploadedFiles ? uploadedFiles.map(file => `/uploads/${file.filename}`) : [];
        
        console.log('Number of images:', images.length);
        console.log('Image paths:', images);

        const result = await pool.query(`
            INSERT INTO cars (
                user_id, brand, model, year, price, description, 
                mileage, transmission, body_type, fuel_type, 
                engine_volume, power, images, status
            ) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) 
            RETURNING *
        `, [
            userId, brand, model, year, price, description, 
            mileage, transmission, bodyType, fuelType, 
            engineVolume, power, images, 'ACTIVE'
        ]);

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating car:', error);
        res.status(500).json({ message: 'Error creating car listing' });
    }
};

export const updateCar = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { brand, model, year, price, description, mileage, transmission, images } = req.body;
        const userId = req.user.id;

        const result = await pool.query(`
            UPDATE cars 
            SET brand = $1, model = $2, year = $3, price = $4, 
                description = $5, mileage = $6, transmission = $7, 
                images = $8, updated_at = NOW()
            WHERE id = $9 AND user_id = $10
            RETURNING *
        `, [brand, model, year, price, description, mileage, transmission, images, id, userId]);

        if (!result.rows.length) {
            return res.status(404).json({ message: 'Car not found or unauthorized' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const deleteCar = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const result = await pool.query(
            'DELETE FROM cars WHERE id = $1 AND user_id = $2 RETURNING id',
            [id, userId]
        );

        if (!result.rows.length) {
            return res.status(404).json({ message: 'Car not found or unauthorized' });
        }

        res.json({ message: 'Car deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const toggleFavorite = async (req: AuthRequest, res: Response) => {
    try {
        const { carId } = req.params;
        const userId = req.user.id;

        const existingFavorite = await pool.query(
            'SELECT * FROM favorites WHERE user_id = $1 AND car_id = $2',
            [userId, carId]
        );

        if (existingFavorite.rows.length) {
            await pool.query(
                'DELETE FROM favorites WHERE user_id = $1 AND car_id = $2',
                [userId, carId]
            );
            res.json({ message: 'Removed from favorites' });
        } else {
            await pool.query(
                'INSERT INTO favorites (user_id, car_id) VALUES ($1, $2)',
                [userId, carId]
            );
            res.json({ message: 'Added to favorites' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const getMyCars = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.id;
        const result = await pool.query(
            'SELECT * FROM cars WHERE user_id = $1 ORDER BY created_at DESC',
            [userId]
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const getFavorites = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.id;
        const result = await pool.query(`
            SELECT c.* 
            FROM cars c
            JOIN favorites f ON c.id = f.car_id
            WHERE f.user_id = $1
            ORDER BY f.created_at DESC
        `, [userId]);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const getPopularCars = async (req: Request, res: Response) => {
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
};
