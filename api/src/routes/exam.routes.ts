import { Router } from 'express';
import { protect } from '../middleware/auth';
import { 
  getExams, 
  getExamById, 
  getExamQuestions, 
  submitExamAnswers, 
  getExamResults 
} from '../controllers/examController';

const router = Router();

// Public routes
router.get('/', getExams);
router.get('/:id', getExamById);
router.get('/:id/questions', getExamQuestions);

// Protected routes
router.use(protect);
router.post('/:id/submissions', submitExamAnswers);
router.get('/:id/results', getExamResults);

export default router;