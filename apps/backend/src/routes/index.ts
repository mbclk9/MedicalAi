import { type Express } from 'express';
import patientsRouter from './patients';  // patients.ts import et

export function registerRoutes(app: Express) {
  app.use('/api/patients', patientsRouter);
  // Diğer router'lar ekle, örneğin health-check.ts: import healthRouter from './health-check'; app.use('/api/health', healthRouter);
}