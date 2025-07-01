# TıpScribe - Turkish AI Medical Scribe Platform 🏥

> **Professional medical transcription and AI-powered note generation platform designed specifically for Turkish healthcare system compliance.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18+-61DAFB.svg)](https://reactjs.org/)

## 🎯 Project Overview

TıpScribe is a comprehensive medical scribe platform that transforms voice recordings into structured medical notes using AI. Built with Turkish healthcare standards (KVKK compliance, T.C. Sağlık Bakanlığı requirements) and modern web technologies.

### ✨ Key Features

- **🎤 Voice Recording**: Real-time audio capture with WebRTC
- **🔤 Turkish Transcription**: Deepgram-powered speech-to-text
- **🤖 AI Medical Notes**: GPT-4 & Claude AI for SOAP format generation
- **📋 Template System**: Specialty-based medical note templates
- **👥 Patient Management**: Complete patient records and visit tracking
- **🔒 KVKK Compliance**: Turkish data protection law adherence
- **📱 Responsive Design**: Modern UI with Tailwind CSS and shadcn/ui

## 🏗️ Architecture

This is a **monorepo** structured for professional development and deployment:

```
tipscribe/
├── apps/
│   ├── frontend/          # React + TypeScript frontend
│   └── backend/           # Express + Node.js API server
├── packages/
│   ├── types/             # Shared TypeScript definitions
│   └── config/            # Shared configuration
├── docs/                  # Documentation
├── tools/                 # Build and deployment tools
└── docker/               # Container configurations
```

### 🔧 Technology Stack

**Frontend (apps/frontend/)**
- React 18 with TypeScript
- Vite for fast development
- Tailwind CSS + shadcn/ui components
- TanStack Query for state management
- Wouter for lightweight routing

**Backend (apps/backend/)**
- Node.js 20 + Express server
- Drizzle ORM + PostgreSQL
- TypeScript with ES modules
- OpenAI & Anthropic AI integration
- Deepgram speech-to-text API

**Shared (packages/)**
- TypeScript types and schemas
- Database models with Drizzle
- Zod validation schemas

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ and npm 10+
- PostgreSQL 16+
- API keys: OpenAI, Anthropic, Deepgram

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/tipscribe/tipscribe.git
   cd tipscribe
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys and database URL
   ```

4. **Database setup**
   ```bash
   # Create database
   createdb tipscribe_db
   
   # Push schema and seed data
   npm run db:push
   npm run db:seed
   ```

5. **Start development servers**
   ```bash
   npm run dev
   ```

   This starts:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 🔑 Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/tipscribe_db"

# AI Services
OPENAI_API_KEY="sk-..."
ANTHROPIC_API_KEY="sk-..."
DEEPGRAM_API_KEY="..."

# Server Configuration
NODE_ENV="development"
PORT=5000
SESSION_SECRET="your-secret-key"

# CORS and Security
CORS_ORIGIN="http://localhost:3000"
MAX_FILE_SIZE=52428800
```

## 📚 Available Scripts

### Root Level Commands
```bash
npm run dev              # Start both frontend and backend
npm run build            # Build all applications
npm run start            # Start production server
npm run test             # Run all tests
npm run lint             # Lint all workspaces
```

### Backend Commands
```bash
npm run build:backend    # Build backend only
npm run db:push          # Push database schema
npm run db:seed          # Seed test data
npm run db:studio        # Open Drizzle Studio
npm run health           # Run health check
```

### Frontend Commands
```bash
npm run build:frontend   # Build frontend only
npm run preview          # Preview production build
```

## 🐳 Docker Deployment

### Development with Docker
```bash
# Build and start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Production Deployment
```bash
# Build production image
docker build -t tipscribe .

# Run with environment variables
docker run -d \
  -p 5000:5000 \
  --env-file .env \
  tipscribe
```

## 📖 API Documentation

Complete API documentation is available at `/docs/API.md`.

### Key Endpoints

- **POST** `/api/transcribe` - Audio transcription
- **POST** `/api/generate-note` - AI medical note generation
- **GET** `/api/patients` - Patient management
- **POST** `/api/visits` - Visit tracking
- **GET** `/api/templates` - Medical templates

### Example Usage

```typescript
// Transcribe audio file
const formData = new FormData();
formData.append('audio', audioFile);

const response = await fetch('/api/transcribe', {
  method: 'POST',
  body: formData
});

const { text, confidence } = await response.json();
```

## 🏥 Medical Compliance

### KVKK (Turkish Data Protection Law)
- ✅ Explicit consent collection
- ✅ Data encryption in transit and at rest
- ✅ Right to deletion and data portability
- ✅ Audit logging for all data access

### T.C. Sağlık Bakanlığı Standards
- ✅ SOAP format medical notes
- ✅ ICD-10 diagnosis coding
- ✅ Turkish medical terminology
- ✅ Healthcare provider authentication

### Security Features
- Session-based authentication
- Rate limiting and request validation
- Encrypted file storage
- Secure API key management
- HTTPS enforcement in production

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run backend tests only
npm run test --workspace=@tipscribe/backend

# Run frontend tests only  
npm run test --workspace=@tipscribe/frontend

# Run tests in watch mode
npm run test:watch
```

## 🛠️ Development Guide

### Adding New Features

1. **Database Changes**
   ```bash
   # Edit schema in packages/types/schema.ts
   # Push changes
   npm run db:push
   ```

2. **API Endpoints**
   ```bash
   # Add routes in apps/backend/src/routes/
   # Update types in packages/types/
   ```

3. **Frontend Components**
   ```bash
   # Add components in apps/frontend/src/components/
   # Use shared types from @/types
   ```

### Code Style

- TypeScript strict mode enabled
- ESLint + Prettier for formatting
- Conventional commits for git messages
- Path aliases configured for clean imports

### Database Schema

The application uses Drizzle ORM with PostgreSQL:

```typescript
// Core entities
- doctors      // Healthcare providers
- patients     // Patient records
- visits       // Medical appointments
- medical_notes // Generated SOAP notes
- recordings   // Audio transcriptions
- templates    // Medical note templates
```

## 🚀 Deployment Guide

### Replit (Recommended)
1. Import project to Replit
2. Configure environment variables
3. Click "Deploy" button

### Cloud Platforms

**Vercel/Netlify (Frontend)**
```bash
npm run build:frontend
# Deploy apps/frontend/dist/
```

**Railway/Heroku (Backend)**
```bash
npm run build:backend
# Deploy with start command: npm run start
```

**AWS/GCP/Azure**
- Use provided Dockerfile
- Configure environment variables
- Set up PostgreSQL database
- Enable HTTPS with reverse proxy

### Production Checklist

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] SSL certificates installed
- [ ] Domain name configured
- [ ] Backup strategy implemented
- [ ] Monitoring setup (health checks)
- [ ] Error tracking configured
- [ ] Rate limiting enabled

## 📊 Monitoring and Health Checks

### Health Check Endpoint
```bash
curl http://localhost:5000/api/health
```

Response:
```json
{
  "status": "healthy",
  "services": {
    "database": true,
    "deepgram": true,
    "openai": true,
    "anthropic": true
  },
  "timestamp": "2025-07-01T11:25:00.000Z",
  "version": "1.0.0"
}
```

### Logging
- Structured logging with timestamps
- Separate log levels (error, warn, info, debug)
- Request/response logging
- Performance metrics

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Workflow
```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and test
npm run test
npm run lint

# Commit changes
git add .
git commit -m "feat: add new feature"

# Push and create PR
git push origin feature/new-feature
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📧 Email: support@tipscribe.com
- 💬 GitHub Issues: [Create an issue](https://github.com/tipscribe/tipscribe/issues)
- 📖 Documentation: [View docs](./docs/)
- 🚀 Deployment Guide: [DEPLOYMENT.md](./docs/DEPLOYMENT.md)

## 🙏 Acknowledgments

- Built for Turkish healthcare professionals
- Compliant with KVKK and healthcare regulations
- Powered by OpenAI, Anthropic, and Deepgram APIs
- UI components by shadcn/ui and Radix UI

---

**Made with ❤️ for Turkish healthcare professionals**