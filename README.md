# Health Pilot

Health Pilot is a full-stack healthcare platform for patients and doctors, featuring authentication, profile management, doctor availability, appointment workflows, medical report uploads, and AI-assisted symptom/report guidance.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Django](https://img.shields.io/badge/Django-4.2.30-green.svg)
![Next.js](https://img.shields.io/badge/Next.js-16.2.3-black.svg)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue.svg)
![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)

## Features

- Email-first authentication with role-aware patient/doctor flows
- Doctor profile and availability management
- Appointment lifecycle (request, accept/reject, complete)
- Medical report upload and review
- AI-assisted symptom/report analysis with specialist suggestions
- Dashboard experiences for both patients and doctors
- REST API with Swagger UI documentation

## Tech Stack

### Frontend
- Next.js 16.2.3 (App Router) + React 19
- TypeScript
- Tailwind CSS 4
- Radix UI
- TanStack Query
- Zod + React Hook Form

### Backend
- Django 4.2.30 + Django REST Framework
- dj-rest-auth + django-allauth
- SQLite (default local) or PostgreSQL
- drf-yasg (Swagger)
- WhiteNoise + Gunicorn for containerized runtime

### AI Provider
- Primary: Hugging Face Inference API (configured via `HUGGINGFACE_API_KEY`)
- Legacy OpenAI wiring is preserved in comments for reference

## Architecture

```text
client (Next.js, :3000) ---> server (Django API, :8000)
                                   | \
                                   |  \-- AI provider (Hugging Face)
                                   \
                                    \-- DB (SQLite local or PostgreSQL in Docker)
```

## Repository Layout

```text
health-pilot/
├─ client/                    # Next.js frontend
├─ server/                    # Django backend
├─ docker-compose.dev.yaml    # Local multi-service stack (db, redis, backend, frontend)
├─ docker-compose.prod.yaml   # Production-oriented compose setup
├─ .env.example               # Environment template
└─ README.md
```

## Quick Start (Local Development)

### Prerequisites

- Python 3.11+
- Node.js 18+
- npm or Bun

### 1) Clone and configure env

```bash
git clone https://github.com/farhan-nahid/health-pilot.git
cd health-pilot
cp .env.example .env
```

### 2) Run backend (Django)

```bash
cd server
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Backend: http://localhost:8000

### 3) Run frontend (Next.js)

In a new terminal:

```bash
cd client
npm install
npm run dev
```

Frontend: http://localhost:3000

## Environment Variables

Create `.env` from `.env.example` at repository root.

Most relevant values for local development:

```env
SECRET_KEY=change-me
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Choose one DB strategy:
# 1) SQLite local: leave DATABASE_URL unset
# 2) PostgreSQL: set DATABASE_URL
DATABASE_URL=postgresql://user:password@host:5432/database

FRONTEND_URL=http://localhost:3000
# NEXT_PUBLIC_API_URL is used by Docker Compose environment wiring
NEXT_PUBLIC_API_URL=http://localhost:8000

# AI (recommended)
HUGGINGFACE_API_KEY=your_hf_token
HUGGINGFACE_MODEL=meta-llama/Meta-Llama-3-8B-Instruct
```

Notes:
- The backend falls back to SQLite when `DATABASE_URL` is not provided.
- If you use Docker dev compose, PostgreSQL and Redis are provisioned for you.
- The current frontend API client defaults to `http://localhost:8000/api` in code.

## Docker

### Development stack

```bash
docker compose -f docker-compose.dev.yaml --env-file .env up --build
```

Services:
- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- Health check: http://localhost:8000/health/
- API docs: http://localhost:8000/api/docs/

### Production-style stack

```bash
docker compose -f docker-compose.prod.yaml --env-file .env up --build -d
```

## API Docs and Useful Endpoints

- Swagger UI: `/api/docs/`
- Health check: `/health/`
- Admin: `/admin/`

Common API groups:
- Auth: `/api/auth/` and `/api/auth/registration/`
- Accounts, doctors, patients, appointments, reviews: mounted under `/api/`

## Development Commands

### Frontend (`client`)

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run format
npm run typecheck
```

### Backend (`server`)

```bash
python manage.py runserver
python manage.py migrate
python manage.py test
```

## Contributing

1. Fork the repository.
2. Create a feature branch.
3. Add or update tests for behavior changes.
4. Run lint/type checks/tests.
5. Open a pull request with a clear summary.

## License

MIT License. See [LICENSE](LICENSE).
