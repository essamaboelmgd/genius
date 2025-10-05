import { Router } from 'express';
import { protect } from '../middleware/auth';
import { requireAdmin } from '../controllers/adminController';
import { 
  createCourse, 
  updateCourse, 
  deleteCourse,
  createExam,
  createAssignment,
  createQuestion,
  getAllUsers
} from '../controllers/adminController';

const router = Router();

// All admin routes require authentication and admin role
router.use(protect, requireAdmin);

// Course management
router.post('/courses', createCourse);
router.put('/courses/:id', updateCourse);
router.delete('/courses/:id', deleteCourse);

// Exam management
router.post('/exams', createExam);

// Assignment management
router.post('/assignments', createAssignment);

// Question management
router.post('/questions', createQuestion);

// User management
router.get('/users', getAllUsers);

export default router;