import { type Express, Router } from 'express';
import patientsRouter from "./patients.js"; // .js uzantısını eklemeyi unutmayın (ESM modülü için)
// Diğer rotalarınızı buraya import edebilirsiniz.
// import visitsRouter from './visits.js';

export function registerRoutes(app: Express) {
  // Tüm API rotaları için merkezi bir yönlendirici oluşturuyoruz.
  const apiRouter = Router();

  // /api/patients yolunu patientsRouter'a bağlıyoruz.
  apiRouter.use('/patients', patientsRouter);

  // Diğer rotaları buraya ekleyin
  // apiRouter.use('/visits', visitsRouter);

  // Ana uygulamaya /api ile başlayan tüm isteklerin bu yönlendirici tarafından
  // yönetileceğini söylüyoruz.
  app.use('/api', apiRouter);
}