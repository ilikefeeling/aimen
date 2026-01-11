# aimen Video API Server

Backend server for handling video uploads, AI analysis, and processing.

## Features

- 🎥 **Video Upload**: Handles up to 500MB files
- 🤖 **AI Analysis**: Gemini-powered sermon analysis
- ⚡ **Background Processing**: Bull queue with Redis
- 📊 **Progress Tracking**: Real-time job status updates
- 🔐 **JWT Authentication**: Secure API access

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `env.example.txt` to `.env` and fill in your values:

```env
PORT=3001
DATABASE_URL=your_database_url
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key
GEMINI_API_KEY=your_gemini_key
REDIS_HOST=localhost
REDIS_PORT=6379
```

### 3. Start Redis (Required)

```bash
# Using Docker
docker run -d -p 6379:6379 redis:alpine

# Or install Redis locally
```

### 4. Run Server

```bash
# Start API server
npm start

# Start worker (in separate terminal)
npm run worker

# Development mode with auto-reload
npm run dev
```

## API Endpoints

### Health Check

```bash
GET /health
```

### Upload Video

```bash
POST /api/upload
Content-Type: multipart/form-data

Fields:
- video: File (max 500MB)
- title: String
- userId: String

Headers:
- Authorization: Bearer <token>
```

### Get Job Status

```bash
GET /api/jobs/:jobId
```

## Architecture

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       ↓
┌─────────────┐
│ API Server  │  ← Express + Multer
└──────┬──────┘
       │
       ↓
┌─────────────┐
│ Bull Queue  │  ← Redis
└──────┬──────┘
       │
       ↓
┌─────────────┐
│   Worker    │  ← AI Analysis
└─────────────┘
```

## Deployment

### Railway

1. Install Railway CLI:

```bash
npm install -g @railway/cli
railway login
```

1. Deploy:

```bash
railway init
railway add redis
railway up
```

1. Set environment variables in Railway dashboard

## Development

### Project Structure

```
video-api/
├── src/
│   ├── server.js          # Express app
│   ├── routes/
│   │   ├── upload.js      # Upload endpoint
│   │   └── jobs.js        # Job status endpoint
│   ├── workers/
│   │   └── analysis.worker.js  # AI analysis worker
│   ├── services/
│   │   ├── storage.js     # Supabase storage
│   │   ├── database.js    # Prisma client
│   │   └── gemini.js      # AI analysis
│   └── utils/
│       └── auth.js        # JWT verification
├── package.json
└── .env
```

### Testing

```bash
# Upload a video
curl -X POST http://localhost:3001/api/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "video=@test.mp4" \
  -F "title=Test Video" \
  -F "userId=test-user-123"

# Check job status
curl http://localhost:3001/api/jobs/JOB_ID
```

## License

MIT
