# TıpScribe Deployment Guide

## Overview
TıpScribe can be deployed in multiple environments:
- **Replit (Recommended)**: Zero-config cloud deployment
- **Local Development**: Full control for development
- **Docker**: Containerized deployment
- **Cloud Services**: AWS, Google Cloud, Azure

## Replit Deployment (Recommended)

### Prerequisites
- Replit account
- Environment variables configured
- Database provisioned

### Steps
1. **Fork/Import Project**
   ```bash
   # Already configured in your Replit environment
   ```

2. **Configure Environment Variables**
   - Add required API keys in Replit Secrets
   - Database URL automatically configured via Neon

3. **Deploy**
   ```bash
   # Click "Deploy" button in Replit interface
   # Or use the deployment workflow
   ```

4. **Verify Deployment**
   - Check application URL: `https://your-repl-name.replit.app`
   - Test API endpoints
   - Verify database connectivity

## Local Development Setup

### Prerequisites
```bash
Node.js 20+
PostgreSQL 16+
Git
```

### Installation
```bash
# Clone repository
git clone <repository-url>
cd tipscribe

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your configuration

# Setup database
createdb tipscribe_db
npm run db:push
npm run db:seed

# Start development server
npm run dev
```

### Environment Configuration
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/tipscribe_db"

# API Keys
DEEPGRAM_API_KEY="your_deepgram_key"
OPENAI_API_KEY="your_openai_key"  
ANTHROPIC_API_KEY="your_anthropic_key"

# Server
PORT=5000
NODE_ENV="development"
```

## Docker Deployment

### Dockerfile
```dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy application code
COPY . .

# Build application
RUN npm run build

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

# Start application
CMD ["npm", "start"]
```

### Docker Compose
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@db:5432/tipscribe_db
      - DEEPGRAM_API_KEY=${DEEPGRAM_API_KEY}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:16-alpine
    environment:
      - POSTGRES_DB=tipscribe_db
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped

volumes:
  postgres_data:
```

### Build and Run
```bash
# Build image
docker build -t tipscribe .

# Run with Docker Compose
docker-compose up -d

# Check logs
docker-compose logs -f app

# Scale application
docker-compose up -d --scale app=3
```

## Cloud Deployment

### AWS Deployment

#### Using AWS ECS
```bash
# Build and push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

docker build -t tipscribe .
docker tag tipscribe:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/tipscribe:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/tipscribe:latest

# Deploy to ECS
aws ecs update-service --cluster tipscribe-cluster --service tipscribe-service --force-new-deployment
```

#### Using AWS Lambda (Serverless)
```yaml
# serverless.yml
service: tipscribe

provider:
  name: aws
  runtime: nodejs20.x
  region: us-east-1
  environment:
    DATABASE_URL: ${env:DATABASE_URL}
    DEEPGRAM_API_KEY: ${env:DEEPGRAM_API_KEY}
    OPENAI_API_KEY: ${env:OPENAI_API_KEY}

functions:
  app:
    handler: dist/lambda.handler
    events:
      - http:
          path: /{proxy+}
          method: ANY
          cors: true
```

### Google Cloud Platform

#### Cloud Run Deployment
```bash
# Build and deploy
gcloud builds submit --tag gcr.io/PROJECT_ID/tipscribe

gcloud run deploy tipscribe \
  --image gcr.io/PROJECT_ID/tipscribe \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="DATABASE_URL=${DATABASE_URL}" \
  --set-env-vars="DEEPGRAM_API_KEY=${DEEPGRAM_API_KEY}"
```

### Azure Deployment

#### Container Instances
```bash
# Deploy to Azure Container Instances
az container create \
  --resource-group tipscribe-rg \
  --name tipscribe-app \
  --image tipscribe:latest \
  --ports 5000 \
  --environment-variables \
    DATABASE_URL=$DATABASE_URL \
    DEEPGRAM_API_KEY=$DEEPGRAM_API_KEY \
  --restart-policy Always
```

## Production Checklist

### Before Deployment
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] SSL certificates installed
- [ ] Domain name configured
- [ ] Backup strategy implemented
- [ ] Monitoring setup complete
- [ ] Load testing performed
- [ ] Security audit completed

### Security Configuration
```nginx
# nginx.conf for production
server {
    listen 443 ssl http2;
    server_name tipscribe.com;
    
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://app:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
    
    location / {
        proxy_pass http://app:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Database Optimization
```sql
-- Production database optimizations
CREATE INDEX CONCURRENTLY idx_visits_patient_date ON visits(patient_id, visit_date DESC);
CREATE INDEX CONCURRENTLY idx_medical_notes_visit ON medical_notes(visit_id);
CREATE INDEX CONCURRENTLY idx_recordings_visit ON recordings(visit_id);

-- Setup connection pooling
ALTER SYSTEM SET max_connections = 100;
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
```

### Monitoring Setup
```yaml
# docker-compose.monitoring.yml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml

  grafana:
    image: grafana/grafana
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana-storage:/var/lib/grafana

  node-exporter:
    image: prom/node-exporter
    ports:
      - "9100:9100"

volumes:
  grafana-storage:
```

## Backup and Recovery

### Database Backup
```bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
DB_NAME="tipscribe_db"

# Create backup
pg_dump $DATABASE_URL > $BACKUP_DIR/backup_$DATE.sql

# Compress
gzip $BACKUP_DIR/backup_$DATE.sql

# Upload to cloud storage
aws s3 cp $BACKUP_DIR/backup_$DATE.sql.gz s3://tipscribe-backups/

# Clean old backups (keep 30 days)
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete
```

### Application Backup
```bash
# Backup uploaded files
rsync -av /app/uploads/ /backups/uploads/

# Backup configuration
cp .env /backups/config/env_$DATE

# Backup logs
tar -czf /backups/logs/logs_$DATE.tar.gz /app/logs/
```

## Performance Optimization

### Application Level
```typescript
// Enable compression
app.use(compression());

// Cache static assets
app.use(express.static('public', {
  maxAge: '1d',
  etag: true
}));

// Connection pooling
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

### Database Level
```sql
-- Optimize frequently used queries
EXPLAIN ANALYZE SELECT * FROM visits 
WHERE patient_id = $1 
ORDER BY visit_date DESC 
LIMIT 10;

-- Partitioning for large tables
CREATE TABLE visits_2025 PARTITION OF visits
FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');
```

## Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Find process using port
lsof -ti:5000 | xargs kill -9

# Or change port
export PORT=3000
```

#### Database Connection Issues
```bash
# Test connection
psql $DATABASE_URL -c "SELECT 1"

# Reset connections
docker-compose restart db
```

#### API Key Issues
```bash
# Test Deepgram API
curl -X GET \
  -H "Authorization: Token $DEEPGRAM_API_KEY" \
  https://api.deepgram.com/v1/projects

# Test OpenAI API
curl -X GET \
  -H "Authorization: Bearer $OPENAI_API_KEY" \n  https://api.openai.com/v1/models
```

### Log Analysis
```bash
# Application logs
docker-compose logs -f app

# Database logs  
docker-compose logs -f db

# Nginx logs
docker-compose logs -f nginx

# Filter errors only
docker-compose logs app 2>&1 | grep ERROR
```

## Support and Maintenance

### Health Checks
- Application: `GET /api/health`
- Database: `SELECT 1`
- External APIs: Test endpoints weekly

### Updates
- Security patches: Weekly
- Dependencies: Monthly
- Database migrations: As needed
- SSL certificates: Before expiry

### Monitoring Alerts
- CPU usage > 80%
- Memory usage > 90%
- Disk space < 10%
- API response time > 2s
- Error rate > 5%