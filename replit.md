# Medical Voice Assistant Platform - Replit Documentation

## Overview

This is a Turkish medical assistant platform designed for healthcare professionals in Turkey. The application combines AI-powered voice transcription with automated medical note generation, specifically tailored for the Turkish healthcare system. The platform supports real-time audio recording, Turkish speech-to-text conversion, and AI-powered medical note formatting compliant with Turkish medical standards.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js with Express server
- **Language**: TypeScript with ES modules  
- **API Style**: RESTful endpoints with JSON responses
- **File Upload**: Multer for audio file handling
- **Session Management**: Express sessions with PostgreSQL store

### Database Layer
- **ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (configured via Neon serverless)
- **Schema Management**: Drizzle migrations with push-based deployment
- **Connection**: Connection pooling via @neondatabase/serverless

## Key Components

### Audio Processing System
- **Recording**: Browser-based MediaRecorder API with WebM format
- **Transcription**: Deepgram SDK for Turkish speech-to-text
- **File Handling**: 50MB limit with memory storage
- **Format Support**: WebM with Opus codec for optimal quality

### AI Integration
- **Language Model**: OpenAI GPT-4o for medical note generation
- **Prompt Engineering**: Specialized prompts for Turkish medical terminology
- **Context Awareness**: Template-based note structuring
- **Medical Formatting**: SOAP format compliance for Turkish healthcare

### User Interface
- **Component Library**: Radix UI primitives with custom styling
- **Layout**: Sidebar navigation with responsive design
- **Forms**: React Hook Form with Zod validation
- **Toast Notifications**: Custom toast system for user feedback

### Medical Templates System
- **Specialty-Based**: Customizable templates by medical specialty
- **SOAP Format**: Structured Subjective, Objective, Assessment, Plan notes
- **Default Templates**: Pre-configured templates for common specialties
- **JSON Structure**: Flexible template definition system

## Data Flow

### Recording Workflow
1. User initiates recording via MediaRecorder API
2. Audio chunks collected in real-time
3. Recording stopped and converted to Blob
4. Audio file uploaded to server via FormData
5. Deepgram processes audio for Turkish transcription
6. Transcription returned to client for review

### Note Generation Process
1. Transcription text submitted with template selection
2. OpenAI GPT-4o processes text with medical context
3. AI generates structured medical note in Turkish
4. Note formatted according to selected template structure
5. Generated note saved to database with visit association
6. Real-time updates via TanStack Query invalidation

### Data Persistence
1. Patient information stored with Turkish ID validation
2. Visit records linked to patients and doctors
3. Medical notes associated with visits
4. Audio recordings optionally stored for compliance
5. Templates managed with specialty categorization

## External Dependencies

### Core Services
- **Deepgram**: Primary speech-to-text service for Turkish language
- **OpenAI**: GPT-4o model for medical note generation
- **Neon Database**: Serverless PostgreSQL hosting

### Development Dependencies
- **Vite**: Build tool with HMR and TypeScript support  
- **ESBuild**: Fast bundling for production builds
- **Tailwind**: Utility-first CSS framework
- **PostCSS**: CSS processing and optimization

### UI Dependencies
- **Radix UI**: Accessible component primitives
- **Lucide Icons**: Consistent icon system
- **React Query**: Server state management
- **Wouter**: Lightweight routing solution

## Deployment Strategy

### Development Environment
- **Runtime**: Node.js 20 with PostgreSQL 16
- **Hot Reload**: Vite dev server with TypeScript support
- **Database**: Local PostgreSQL with Drizzle migrations
- **Port Configuration**: Server on 5000, exposed on port 80

### Production Build
- **Frontend**: Vite build with optimized assets
- **Backend**: ESBuild bundle with external packages
- **Database**: Drizzle push for schema deployment
- **Environment**: Node.js production mode with process management

### Replit Configuration
- **Modules**: nodejs-20, web, postgresql-16
- **Build Command**: `npm run build`
- **Start Command**: `npm run start`
- **Auto-scaling**: Configured for production deployment

## Changelog
```
Changelog:
- June 27, 2025. Initial setup
```

## User Preferences
```
Preferred communication style: Simple, everyday language.
```