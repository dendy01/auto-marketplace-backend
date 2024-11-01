import { Router, Request, Response, RequestHandler } from 'express';
import { 
    getAllCars, 
    getCarById, 
    createCar, 
    updateCar, 
    deleteCar, 
    toggleFavorite,
    getPopularCars
} from '../controllers/carsController';
import { authMiddleware } from '../middleware/auth';
import upload from '../middleware/upload';

const router = Router();

// Public routes (no auth required)
router.get('/popular', getPopularCars as RequestHandler);
router.get('/', getAllCars as RequestHandler);
router.get('/:id', getCarById as RequestHandler);

// Protected routes
router.use(authMiddleware as RequestHandler);
router.post('/', upload.array('images', 10), createCar as RequestHandler);
router.put('/:id', upload.array('images', 10), updateCar as RequestHandler);
router.delete('/:id', deleteCar as RequestHandler);
router.post('/:carId/favorite', toggleFavorite as RequestHandler);

export default router;
