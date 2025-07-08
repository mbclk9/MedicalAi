import { Request, Response, NextFunction } from 'express';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message?: string;
}

class RateLimiter {
  private requests: Map<string, { count: number; resetTime: number }> = new Map();

  createLimiter(config: RateLimitConfig) {
    return (req: Request, res: Response, next: NextFunction) => {
      const key = req.ip || 'unknown';
      const now = Date.now();
      
      const clientData = this.requests.get(key);
      
      if (!clientData || now > clientData.resetTime) {
        this.requests.set(key, {
          count: 1,
          resetTime: now + config.windowMs
        });
        return next();
      }
      
      if (clientData.count >= config.maxRequests) {
        return res.status(429).json({
          error: 'Too many requests',
          message: config.message || 'Rate limit exceeded',
          retryAfter: Math.ceil((clientData.resetTime - now) / 1000)
        });
      }
      
      clientData.count++;
      next();
    };
  }
}

const rateLimiter = new RateLimiter();

// Genel API rate limit - 100 istek/dakika
export const generalRateLimit = rateLimiter.createLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100,
  message: 'Çok fazla istek gönderiyorsunuz. Lütfen bir dakika bekleyin.'
});

// AI işlemleri için daha kısıtlı - 10 istek/dakika
export const aiRateLimit = rateLimiter.createLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10,
  message: 'AI işlemleri için rate limit aşıldı. Lütfen bekleyin.'
});

// Transcription için orta seviye - 20 istek/dakika
export const transcriptionRateLimit = rateLimiter.createLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 20,
  message: 'Ses transkripsiyon limiti aşıldı. Lütfen bekleyin.'
});