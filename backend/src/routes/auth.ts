import { Router, Request, Response } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

// Get current user info
router.get('/me', requireAuth, (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  res.json(authReq.user);
});

// Login endpoint (placeholder for future implementation)
router.post('/login', (req, res) => {
  res.json({ message: 'Login not implemented yet' });
});

// Logout endpoint
router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

export default router;