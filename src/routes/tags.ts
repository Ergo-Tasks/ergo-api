import { Router } from 'express';
import { restricted } from '../middleware/auth';

const router = Router();

router.post('/:userId', restricted, async (req, res) => {
  
});


