import { Router } from 'express';
import { storage } from '../database/storage';
import { deepgramService } from '../services/deepgramService';
import { transcriptionRateLimit } from '../middleware/rateLimit';
import multer from 'multer';

const router = Router();

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// Transcribe audio file
router.post('/', transcriptionRateLimit, upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No audio file provided" });
    }

    console.log(`Transcribing audio: ${req.file.originalname}, size: ${req.file.size} bytes`);
    
    const language = req.body.language || "tr";
    const transcriptionResult = await deepgramService.transcribeAudio(req.file.buffer, language);
    
    console.log(`Transcription completed: ${transcriptionResult.text.substring(0, 100)}...`);
    
    res.json(transcriptionResult);
  } catch (error) {
    console.error("Transcription error:", error);
    res.status(500).json({ error: "Failed to transcribe audio" });
  }
});

// Save recording with transcription
router.post('/recordings', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No audio file provided" });
    }

    const { visitId, transcription } = req.body;
    
    if (!visitId) {
      return res.status(400).json({ error: "Visit ID is required" });
    }

    const recordingData = {
      visitId: parseInt(visitId),
      audioData: req.file.buffer,
      transcription: transcription || null,
      duration: null, // Could be extracted from audio metadata
      format: req.file.mimetype
    };

    const recording = await storage.createRecording(recordingData);
    res.json({ id: recording.id, message: "Recording saved successfully" });
  } catch (error) {
    console.error("Save recording error:", error);
    res.status(500).json({ error: "Failed to save recording" });
  }
});

// Get recording by visit ID
router.get('/recordings/:visitId', async (req, res) => {
  try {
    const visitId = parseInt(req.params.visitId);
    const recording = await storage.getRecording(visitId);
    
    if (!recording) {
      return res.status(404).json({ error: "Recording not found" });
    }

    // Return recording metadata (not the binary data)
    const { audioData, ...recordingMetadata } = recording;
    res.json(recordingMetadata);
  } catch (error) {
    console.error("Get recording error:", error);
    res.status(500).json({ error: "Failed to fetch recording" });
  }
});

export default router;