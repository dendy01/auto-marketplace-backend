import { Request, Response } from 'express';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'auto_marketplace',
    password: 'your_password',
    port: 5432,
});

interface AuthRequest extends Request {
    user: {
        id: number;
        email: string;
        role: string;
    };
    file?: Express.Multer.File;
}

export const getProfile = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.id;
        const result = await pool.query(
            'SELECT id, name, email, phone, avatar FROM users WHERE id = $1',
            [userId]
        );

        if (!result.rows.length) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.id;
        const { name, email, phone } = req.body;

        const result = await pool.query(
            `UPDATE users 
             SET name = $1, email = $2, phone = $3, updated_at = NOW()
             WHERE id = $4 
             RETURNING id, name, email, phone`,
            [name, email, phone, userId]
        );

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const updatePassword = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;

        const user = await pool.query(
            'SELECT password FROM users WHERE id = $1',
            [userId]
        );

        const isValidPassword = await bcrypt.compare(currentPassword, user.rows[0].password);
        if (!isValidPassword) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await pool.query(
            'UPDATE users SET password = $1 WHERE id = $2',
            [hashedPassword, userId]
        );

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const updateAvatar = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.id;
        const avatarUrl = req.file?.path;

        if (!avatarUrl) {
            return res.status(400).json({ message: 'No avatar file provided' });
        }

        const result = await pool.query(
            'UPDATE users SET avatar = $1 WHERE id = $2 RETURNING avatar',
            [avatarUrl, userId]
        );

        res.json({ avatar: result.rows[0].avatar });
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
