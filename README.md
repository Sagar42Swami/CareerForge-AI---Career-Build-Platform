# Pathwise

AI-powered career guidance platform — resume parsing, skill gap analysis, job matching, mock interviews, and career counseling.

## Architecture

```
React Frontend → Node/Express API Gateway → Auth, Resume Parser, LLM, Jobs, Chat/RAG → MongoDB + Vector DB
```

## MVP Features

- User authentication (JWT)
- Resume upload & parsing (PDF/DOCX)
- ATS scoring & skill extraction
- Career path recommendations
- Skill gap analysis with learning resources
- Job market insights & semantic matching
- Mock interview practice
- AI career counselor chat (RAG)

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB (Atlas or local)
- OpenAI API key
- Chroma (local via Docker) or Pinecone

### Backend

```bash
cd server
cp .env.example .env   # fill in your keys
npm install
npm run seed           # seed job roles
npm run dev
```

### Frontend

```bash
cd client
cp .env.example .env
npm install
npm run dev
```

### Vector DB (Chroma via Docker)

```bash
docker run -p 8000:8000 chromadb/chroma
```

## Environment Variables

See `server/.env.example` and `client/.env.example`.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Current user |
| POST | `/api/resume/upload` | Upload resume |
| GET | `/api/recommendations/:userId` | Get recommendations |
| POST | `/api/recommendations/refresh` | Refresh recommendations |
| GET | `/api/jobs/market-insights` | Market stats |
| GET | `/api/jobs/match` | Semantic job matching |
| POST | `/api/chat` | Career counselor chat |
| POST | `/api/interview/start` | Start mock interview |
| POST | `/api/interview/answer` | Submit interview answer |

## License

MIT
