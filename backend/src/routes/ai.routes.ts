import { Router } from 'express';
import { getAIResponse } from '../controllers/ai';

const router = Router();

// /api/ai/chat
router.post('/chat', (req, res) => getAIResponse(req, res));

export default router;
