import { Router } from 'express';
import { protect } from '../middleware/auth';
import { 
  getUserSubscriptions, 
  subscribeToCourse, 
  getSubscriptionById 
} from '../controllers/subscriptionController';

const router = Router();

// All routes require authentication
router.use(protect);

router.get('/', getUserSubscriptions);
router.post('/', subscribeToCourse);
router.get('/:id', getSubscriptionById);

export default router;