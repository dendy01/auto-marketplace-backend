import { Router, RequestHandler } from 'express';
import { 
    getProfile, 
    updateProfile, 
    updatePassword, 
    updateAvatar, 
    getMyCars, 
    getFavorites 
} from '../controllers/userController';
import { authMiddleware } from '../middleware/auth';
import upload from '../middleware/upload';

const router = Router();

// All routes are protected
router.use((authMiddleware as unknown) as RequestHandler);

// Profile routes
router.get('/profile', (getProfile as unknown) as RequestHandler);
router.put('/profile', (updateProfile as unknown) as RequestHandler);
router.put('/password', (updatePassword as unknown) as RequestHandler);
router.put('/avatar', upload.single('avatar'), (updateAvatar as unknown) as RequestHandler);

// Cars routes
router.get('/cars', (getMyCars as unknown) as RequestHandler);
router.get('/favorites', (getFavorites as unknown) as RequestHandler);

export default router;
