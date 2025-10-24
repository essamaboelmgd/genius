import { Router } from 'express';
import { protect } from '../middleware/auth';
import { requireAdmin } from '../controllers/adminController';
import { 
  createCourse, 
  updateCourse, 
  deleteCourse,
  createExam,
  updateExam,
  deleteExam,
  createAssignment,
  updateAssignment, // Added
  deleteAssignment, // Added
  createQuestion,
  updateQuestion,
  deleteQuestion,
  getAllUsers,
  getDashboardStats,
  createLesson,
  updateLesson,
  deleteLesson,
  updateSubscriptionStatus // Added
} from '../controllers/adminController';

const router = Router();

// All admin routes require authentication and admin role
router.use(protect, requireAdmin);

// Course management
router.post('/courses', createCourse);
router.put('/courses/:id', updateCourse);
router.delete('/courses/:id', deleteCourse);

// Lesson management
router.post('/lessons', createLesson);
router.put('/lessons/:id', updateLesson);
router.delete('/lessons/:id', deleteLesson);

// Exam management
router.post('/exams', createExam);
router.put('/exams/:id', updateExam);
router.delete('/exams/:id', deleteExam);

// Assignment management
router.post('/assignments', createAssignment);
router.put('/assignments/:id', updateAssignment); // Added
router.delete('/assignments/:id', deleteAssignment); // Added

// Question management
router.post('/questions', createQuestion);
router.put('/questions/:id', updateQuestion);
router.delete('/questions/:id', deleteQuestion);

// User management
router.get('/users', getAllUsers);

// Subscription management
router.put('/subscriptions/:id/status', updateSubscriptionStatus); // Added

// Dashboard statistics
router.get('/stats', getDashboardStats);

export default router;