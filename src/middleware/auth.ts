import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

interface AuthRequest extends Request {
    user?: {
        id: number;
        email: string;
        role: string;
    }
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
    // List of public routes that don't require authentication
    const publicRoutes = ['/popular', '/', '/api/cars/popular'];
    
    // Check if the current path is in the public routes list
    if (publicRoutes.includes(req.path)) {
        return next();
    }

    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const decoded = jwt.verify(token, JWT_SECRET) as {
            id: number;
            email: string;
            role: string;
        };
        
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
};
