import { Router, RequestHandler } from 'express';
import { 
    getAllCars, 
    getCarById, 
    createCar, 
    updateCar, 
    deleteCar, 
    toggleFavorite,
    getMyCars,
    getFavorites,
    getPopularCars
} from '../controllers/carsController';
import { authMiddleware } from '../middleware/auth';
import upload from '../middleware/upload';

const router = Router();

// Protected routes
router.use(authMiddleware as RequestHandler);

// Special routes first
router.get('/my', (getMyCars as unknown) as RequestHandler);
router.get('/favorites', (getFavorites as unknown) as RequestHandler);
router.get('/popular', (getPopularCars as unknown) as RequestHandler);

// Standard CRUD routes
router.get('/', (getAllCars as unknown) as RequestHandler);
router.get('/:id', (getCarById as unknown) as RequestHandler);
router.post('/', upload.array('images', 10), (createCar as unknown) as RequestHandler);
router.put('/:id', upload.array('images', 10), (updateCar as unknown) as RequestHandler);
router.delete('/:id', (deleteCar as unknown) as RequestHandler);
router.post('/:carId/favorite', (toggleFavorite as unknown) as RequestHandler);

export default router;
