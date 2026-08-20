# Pathwise

Pathwise is an AI-powered career guidance platform for resume analysis, career-path recommendations, skill-gap analysis, job-market insights, mock interviews, and an AI career counselor.

## Architecture

```text
React + Vite + Tailwind
        │
        ▼
Node.js + Express REST API
   ┌────┼───────────┬───────────┐
   ▼    ▼           ▼           ▼
 Auth  Resume      Jobs      Interview/Chat
   │    │           │           │
   └────┴───────────┴───────────┘
             │
             ▼
      MongoDB + Chroma
             │
             ▼
        OpenAI APIs
```

## MVP implementation

- JWT user authentication and protected routes
- PDF/DOCX/TXT resume upload and text extraction
- Resume skill extraction with OpenAI + deterministic fallback
- ATS scoring
- Personalized career-path recommendations
- Skill-gap analysis with learning resources
- Job-market insights and semantic job matching
- AI mock interview with answer scoring and feedback
- AI career counselor with RAG context
- AI cover-letter generation from the latest uploaded resume
- Profile management
- Docker Compose for MongoDB, Chroma, API, and frontend

The application remains usable without an OpenAI key for the core resume, recommendation, interview, and counselor flows through deterministic fallbacks. Semantic embeddings require an OpenAI key and Chroma.

## Prerequisites

- Node.js 18+ (Node.js 20 recommended)
- npm
- MongoDB 7+ or Docker
- ChromaDB or Docker
- OpenAI API key for LLM and semantic-vector features

## Quick start

### Option A — Docker Compose

1. Copy the environment template:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

2. Set `OPENAI_API_KEY` in your shell or `.env` as needed.

3. Start the stack:

```bash
docker compose up --build
```

4. Seed the job-role catalog:

```bash
docker compose exec server npm run seed
```

5. Open the frontend at `http://localhost:3000`.

### Option B — Run locally

Start MongoDB and Chroma first, then:

```bash
cd server
npm install
cp .env.example .env
npm run seed
npm run dev
```

In another terminal:

```bash
cd client
npm install
cp .env.example .env
npm run dev
```

The Vite development server runs on `http://localhost:5173` by default. The API runs on `http://localhost:5000`.

## Environment variables

### Server — `server/.env`

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/pathwise
JWT_SECRET=replace-with-a-long-random-secret
OPENAI_API_KEY=
CHROMA_URL=http://localhost:8000
NODE_ENV=development
```

### Client — `client/.env`

```env
VITE_API_URL=http://localhost:5000/api
```

Never commit real API keys or production secrets.

## API endpoints

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Register |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Current user |
| PUT | `/api/auth/profile` | Update profile |
| POST | `/api/resume/upload` | Upload and analyze resume |
| GET | `/api/resume/latest` | Latest resume |
| GET | `/api/resume/history` | Resume history |
| POST | `/api/resume/cover-letter` | Generate cover letter |
| GET | `/api/recommendations/:userId` | Get recommendations |
| POST | `/api/recommendations/refresh` | Refresh recommendations |
| GET | `/api/jobs/market-insights` | Market statistics |
| GET | `/api/jobs/match` | Semantic/fallback job matching |
| GET | `/api/jobs/roles` | Job-role catalog |
| POST | `/api/chat` | Career counselor |
| GET | `/api/chat/sessions` | Chat sessions |
| POST | `/api/interview/start` | Start mock interview |
| POST | `/api/interview/answer` | Submit interview answer |
| GET | `/api/interview/sessions` | Interview history |
| GET | `/api/health` | API health check |

## Project structure

```text
pathwise/
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── pages/
│   │   └── services/
│   └── package.json
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   ├── tests/
│   └── package.json
├── docker-compose.yml
└── README.md
```

## Validation

Frontend:

```bash
cd client
npm test
npm run build
```

Backend:

```bash
cd server
npm test
```

Backend integration tests require a reachable MongoDB instance configured through `MONGODB_URI`.

## Notes

- Resume uploads are limited to 5 MB.
- Passwords are stored as bcrypt hashes.
- JWT authentication protects user-specific API endpoints.
- User data is scoped by authenticated user ID.
- The recommendation and matching layers have non-LLM fallbacks so the MVP can be developed locally without a live OpenAI account.
- Chroma is used for semantic role matching when embeddings are available.

## License

MIT
