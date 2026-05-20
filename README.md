# TaskFlow

A task management application with a FastAPI backend and React frontend.

## Quick Start

```bash
docker compose up --build
```

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API: [http://localhost:8000/api/health](http://localhost:8000/api/health)

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Python 3.13, FastAPI, SQLite, Pydantic v2, Uvicorn |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS v4, shadcn/ui, Recharts |
| Database | SQLite (persisted via Docker volume) |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/tasks` | List all tasks |
| GET | `/api/tasks/stats` | Task statistics |
| GET | `/api/tasks/{id}` | Get a task |
| POST | `/api/tasks` | Create a task |
| PATCH | `/api/tasks/{id}` | Update a task |
| DELETE | `/api/tasks/{id}` | Delete a task |

## Development

### Backend

```bash
cd backend
pip install -r requirements.txt
pytest -q                    # Run tests
ruff check .                 # Lint
python -m compileall . -q    # Syntax check
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev       # Dev server on port 3000
npm run build     # Production build + type check
npm run lint      # ESLint
```

## Project Structure

```
task-management-app/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app entry point
│   │   ├── models.py         # Pydantic models
│   │   ├── routes.py         # API endpoints
│   │   └── database.py      # SQLite + migrations
│   └── tests/
│       ├── conftest.py       # Test fixtures
│       └── test_tasks.py     # CRUD tests
├── frontend/
│   └── src/
│       ├── api.ts            # API client
│       ├── App.tsx           # Router
│       ├── pages/            # Route pages
│       └── components/      # UI components
├── docker-compose.yml
├── AGENTS.md                 # Agent instructions
└── docs/
    ├── ARCHITECTURE.md       # Project structure & connections
    ├── BACKEND.md            # API, schema, migrations, testing
    ├── FRONTEND.md           # Components, routing, API layer
    └── DEVELOPMENT.md        # Checklists & command reference
```

## Documentation

- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** — Project structure, tech stack, how services connect
- **[BACKEND.md](docs/BACKEND.md)** — API reference, DB schema, how to add fields/endpoints, testing
- **[FRONTEND.md](docs/FRONTEND.md)** — Component tree, API layer, routing, how to add UI fields
- **[DEVELOPMENT.md](docs/DEVELOPMENT.md)** — Command reference, change checklists, PR conventions