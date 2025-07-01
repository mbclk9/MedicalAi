import { Request, Response, NextFunction } from 'express';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    name: string;
    specialty: string;
  };
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  // For now, auto-login as default doctor
  req.user = {
    id: 1,
    name: 'Dr. Mehmet Yılmaz',
    specialty: 'Dahiliye'
  };
  next();
}

export function optionalAuth(req: AuthRequest, res: Response, next: NextFunction) {
  // Optional authentication - set user if available
  req.user = {
    id: 1,
    name: 'Dr. Mehmet Yılmaz',
    specialty: 'Dahiliye'
  };
  next();
}