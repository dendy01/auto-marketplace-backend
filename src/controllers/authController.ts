import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../config/database';

const generateToken = (user: any): string => {
    return jwt.sign(
        { 
            id: user.id,
            email: user.email,
            role: user.role 
        },
        JWT_SECRET,
        { expiresIn: '24h' }
    );
};

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export const register = async (req: Request, res: Response) => {
    try {
        const { email, password, name, phone } = req.body;
        console.log('Registration attempt with data:', { email, name, phone });

        // Check if all required fields are present
        if (!email || !password || !name || !phone) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Check existing user
        const userExists = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (userExists.rows.length > 0) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert user
        const result = await pool.query(
            `INSERT INTO users (email, password, name, phone, role)
             VALUES ($1, $2, $3, $4, 'USER')
             RETURNING id, email, name, phone, role`,
            [email, hashedPassword, name, phone]
        );

        const user = result.rows[0];
        const token = generateToken(user);

        console.log('User registered successfully:', { userId: user.id });

        return res.status(201).json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                phone: user.phone,
                role: user.role
            },
            token
        });
    } catch (error: any) {
        console.error('Registration error:', error);
        return res.status(500).json({ 
            message: 'Registration failed',
            details: error.message 
        });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (!result.rows.length) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const user = result.rows[0];

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name
            },
            token
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const refreshToken = async (req: Request, res: Response) => {
    try {
        const { token } = req.body;
        const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
        
        const result = await pool.query(
            'SELECT id, email, name FROM users WHERE id = $1',
            [decoded.id]
        );

        if (!result.rows.length) {
            return res.status(404).json({ message: 'User not found' });
        }

        const newToken = jwt.sign(
            { id: decoded.id },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ token: newToken });
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
};
