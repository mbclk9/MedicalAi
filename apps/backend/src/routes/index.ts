import { type Express, Router } from 'express';
import patientsRouter from "./patients.js"; // .js uzantısını eklemeyi unutmayın (ESM modülü için)
// Diğer rotalarınızı buraya import edebilirsiniz.
// import visitsRouter from './visits.js';

export function registerRoutes(app: Express) {
  // Tüm API rotaları için merkezi bir yönlendirici oluşturuyoruz.
  const apiRouter = Router();

  // /api/patients yolunu patientsRouter'a bağlıyoruz.
  apiRouter.use('/patients', patientsRouter);

  // Doctor endpoint'i
  apiRouter.get('/doctor', async (req, res) => {
    try {
      console.log("👨‍⚕️ Current doctor request received");
      
      // For now, return a default doctor
      // In a real app, this would be based on authentication/session
      res.json({
        id: 1,
        name: "Dr. Ahmet Yılmaz",
        specialty: "Kardiyoloji",
        email: "ahmet.yilmaz@hastane.com",
        licenseNumber: "12345",
        createdAt: new Date()
      });
    } catch (error: any) {
      console.error("❌ Get current doctor error:", error);
      res.status(500).json({ 
        message: "Failed to get current doctor",
        error: error.message 
      });
    }
  });

  // Recent visits endpoint
  apiRouter.get('/recent', async (req, res) => {
    try {
      console.log("📋 Recent visits request received");
      
      // For now, return empty array
      // In a real app, this would fetch recent visits from database
      res.json([]);
    } catch (error: any) {
      console.error("❌ Get recent visits error:", error);
      res.status(500).json({ 
        message: "Failed to get recent visits",
        error: error.message 
      });
    }
  });

  // Diğer rotaları buraya ekleyin
  // apiRouter.use('/visits', visitsRouter);

  // Ana uygulamaya /api ile başlayan tüm isteklerin bu yönlendirici tarafından
  // yönetileceğini söylüyoruz.
  app.use('/api', apiRouter);
}