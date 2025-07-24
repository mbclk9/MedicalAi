import { type Express, Router } from 'express';
import patientsRouter from "./patients.js"; // .js uzantısını eklemeyi unutmayın (ESM modülü için)
// Diğer rotalarınızı buraya import edebilirsiniz.
// import visitsRouter from './visits.js';

export function registerRoutes(app: Express) {
  // Tüm API rotaları için merkezi bir yönlendirici oluşturuyoruz.
  const apiRouter = Router();

  // /api/patients yolunu patientsRouter'a bağlıyoruz.
  apiRouter.use('/patients', patientsRouter);

  // Templates endpoint'i
  apiRouter.get('/templates', async (req, res) => {
    try {
      console.log("📋 Templates request received");
      
      // For now, return sample templates
      // In a real app, this would fetch templates from database
      res.json([
        {
          id: 1,
          name: "Kardiyoloji Muayene",
          specialty: "Kardiyoloji",
          content: "Kardiyoloji muayene şablonu...",
          createdAt: new Date()
        },
        {
          id: 2,
          name: "Genel Muayene",
          specialty: "Genel",
          content: "Genel muayene şablonu...",
          createdAt: new Date()
        }
      ]);
    } catch (error: any) {
      console.error("❌ Get templates error:", error);
      res.status(500).json({ 
        message: "Failed to get templates",
        error: error.message 
      });
    }
  });

  // Visits endpoint'i
  apiRouter.get('/visits', async (req, res) => {
    try {
      console.log("📋 Visits request received");
      
      // For now, return empty array
      // In a real app, this would fetch visits from database
      res.json([]);
    } catch (error: any) {
      console.error("❌ Get visits error:", error);
      res.status(500).json({ 
        message: "Failed to get visits",
        error: error.message 
      });
    }
  });

  // Create visit endpoint
  apiRouter.post('/visits', async (req, res) => {
    try {
      console.log("📝 Create visit request received:", req.body);
      
      const { patientId, doctorId, templateId, visitType } = req.body;
      
      if (!patientId || !doctorId || !visitType) {
        return res.status(400).json({ 
          message: "PatientId, doctorId and visitType are required" 
        });
      }
      
      // For now, return a mock visit
      // In a real app, this would create visit in database
      const newVisit = {
        id: Date.now(),
        patientId,
        doctorId,
        templateId,
        visitType,
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      console.log("✅ Visit created:", newVisit.id);
      res.status(201).json(newVisit);
    } catch (error: any) {
      console.error("❌ Create visit error:", error);
      res.status(500).json({ 
        message: "Failed to create visit",
        error: error.message 
      });
    }
  });

  // Get visit by ID endpoint
  apiRouter.get('/visits/:id', async (req, res) => {
    try {
      console.log("📋 Get visit request received, ID:", req.params.id);
      
      // For now, return a mock visit
      // In a real app, this would fetch visit from database
      const visit = {
        id: parseInt(req.params.id),
        patientId: 1,
        doctorId: 1,
        templateId: 1,
        visitType: "kontrol",
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      res.json(visit);
    } catch (error: any) {
      console.error("❌ Get visit error:", error);
      res.status(500).json({ 
        message: "Failed to get visit",
        error: error.message 
      });
    }
  });

  // Update visit endpoint (PATCH)
  apiRouter.patch('/visits/:id', async (req, res) => {
    try {
      console.log("📝 Update visit request received, ID:", req.params.id, "Data:", req.body);
      
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ 
          message: "Status is required" 
        });
      }
      
      // For now, return a mock updated visit
      // In a real app, this would update visit in database
      const updatedVisit = {
        id: parseInt(req.params.id),
        patientId: 1,
        doctorId: 1,
        templateId: 1,
        visitType: "kontrol",
        status: status,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      console.log("✅ Visit updated:", updatedVisit.id);
      res.json(updatedVisit);
    } catch (error: any) {
      console.error("❌ Update visit error:", error);
      res.status(500).json({ 
        message: "Failed to update visit",
        error: error.message 
      });
    }
  });

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

  // Generate note endpoint
  apiRouter.post('/generate-note', async (req, res) => {
    try {
      console.log("📝 Generate note request received:", req.body);
      
      const { transcription, visitId, templateId } = req.body;
      
      if (!transcription || !visitId) {
        return res.status(400).json({ 
          message: "Transcription and visitId are required" 
        });
      }
      
      // For now, return a mock generated note
      // In a real app, this would use AI to generate medical note
      const generatedNote = {
        id: Date.now(),
        visitId: visitId,
        transcription: transcription,
        generatedNote: {
          subjective: "Hasta şikayetlerini anlattı...",
          objective: "Muayene bulguları...",
          assessment: "Tanı ve değerlendirme...",
          plan: "Tedavi planı..."
        },
        createdAt: new Date()
      };
      
      console.log("✅ Note generated for visit:", visitId);
      res.status(201).json(generatedNote);
    } catch (error: any) {
      console.error("❌ Generate note error:", error);
      res.status(500).json({ 
        message: "Failed to generate note",
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