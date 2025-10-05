import { Router } from 'express';
import { protect } from '../middleware/auth';
import { 
  getCourses, 
  getCourseById, 
  getCourseLessons 
} from '../controllers/courseController';

const router = Router();

// Public routes
router.get('/', getCourses);
router.get('/:id', getCourseById);
router.get('/:id/lessons', getCourseLessons);

export default router;