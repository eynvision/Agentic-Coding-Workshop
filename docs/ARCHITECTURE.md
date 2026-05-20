# Architecture

## Overview

TaskFlow is a task management application with a FastAPI backend and a React frontend, orchestrated via Docker Compose.

```
task-management-app/
├── backend/               # FastAPI Python backend
│   ├── app/
│   │   ├── main.py        # FastAPI app + CORS + router init
│   │   ├── models.py      # Pydantic request/response models
│   │   ├── routes.py      # API endpoints
│   │   └── database.py    # SQLite setup + migrations
│   ├── tests/
│   │   ├── conftest.py    # Test fixtures (in-memory DB, TestClient)
│   │   └── test_tasks.py  # Baseline CRUD tests
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/              # Vite + React + TypeScript
│   ├── src/
│   │   ├── api.ts         # API client (fetch wrapper)
│   │   ├── App.tsx        # Router setup
│   │   ├── main.tsx       # Entry point (BrowserRouter)
│   │   ├── pages/         # Route pages
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── TasksPage.tsx
│   │   │   ├── AnalyticsPage.tsx   # Placeholder
│   │   │   └── SettingsPage.tsx    # Placeholder
│   │   └── components/
│   │       ├── Layout.tsx
│   │       ├── Sidebar.tsx
│   │       ├── StatsCards.tsx
│   │       ├── TaskTable.tsx
│   │       ├── TaskModal.tsx
│   │       ├── TaskChart.tsx
│   │       └── ui/         # shadcn/ui components
│   ├── Dockerfile
│   └── vite.config.ts
├── docker-compose.yml
└── docs/
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Python 3.13, FastAPI, SQLite, Pydantic v2, Uvicorn |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS v4, shadcn/ui, Recharts, React Router, Lucide icons |
| Database | SQLite (file-based in Docker volume at `/data/tasks.db`) |
| Testing | pytest + FastAPI TestClient (in-memory SQLite), ruff for linting |

## How Frontend Talks to Backend

- Frontend runs on port **3000**, backend on port **8000**
- Vite dev server proxies all `/api/*` requests to `http://backend:8000` (via `vite.config.ts`)
- All API endpoints are prefixed with `/api`

## Docker

```bash
docker compose up --build     # Start everything
docker compose down           # Stop everything
docker compose up -d           # Start in background
```

- Backend healthcheck pings `/api/health` every 5s
- Frontend waits for backend to be healthy before starting
- SQLite data persists in `taskflow-data` Docker volume